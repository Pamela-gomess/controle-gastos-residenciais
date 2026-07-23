using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PessoasController : ControllerBase
    {
        // GET: api/Pessoas
        [HttpGet]
        public async Task<IActionResult> GetPessoas()
        {
            using var db = new AppDbContext();
            db.Database.EnsureCreated();
            var pessoas = await db.Pessoas.ToListAsync();
            return Ok(pessoas);
        }

        // POST: api/Pessoas
        [HttpPost]
        public async Task<IActionResult> CriarPessoa([FromBody] Pessoa pessoa)
        {
            if (string.IsNullOrWhiteSpace(pessoa.Nome) || pessoa.Idade < 0)
            {
                return BadRequest("Nome inválido ou idade não pode ser negativa.");
            }

            using var db = new AppDbContext();
            db.Database.EnsureCreated();

            pessoa.Id = Guid.NewGuid().ToString();
            db.Pessoas.Add(pessoa);
            await db.SaveChangesAsync();

            return Ok(pessoa);
        }

        // DELETE: api/Pessoas/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletarPessoa(string id)
        {
            using var db = new AppDbContext();
            db.Database.EnsureCreated();

            var pessoa = await db.Pessoas.FindAsync(id);
            if (pessoa == null)
            {
                return NotFound("Pessoa não encontrada.");
            }

            // Remove transações associadas
            var transacoes = db.Transacoes.Where(t => t.PessoaId == id);
            db.Transacoes.RemoveRange(transacoes);

            db.Pessoas.Remove(pessoa);
            await db.SaveChangesAsync();

            return Ok(new { mensagem = "Pessoa e suas transações vinculadas foram excluídas com sucesso." });
        }

        // GET: api/Pessoas/Totais
        [HttpGet("Totais")]
        public async Task<IActionResult> GetTotais()
        {
            using var db = new AppDbContext();
            db.Database.EnsureCreated();

            var pessoas = await db.Pessoas.ToListAsync();
            var transacoes = await db.Transacoes.ToListAsync();

            var totaisPessoas = pessoas.Select(p =>
            {
                var transacoesPessoa = transacoes.Where(t => t.PessoaId == p.Id).ToList();
                decimal totalReceitas = transacoesPessoa.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor);
                decimal totalDespesas = transacoesPessoa.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor);

                return new
                {
                    id = p.Id,
                    nome = p.Nome,
                    idade = p.Idade,
                    totalReceitas = totalReceitas,
                    totalDespesas = totalDespesas,
                    saldo = totalReceitas - totalDespesas
                };
            }).ToList();

            decimal resumoReceitas = totaisPessoas.Sum(t => t.totalReceitas);
            decimal resumoDespesas = totaisPessoas.Sum(t => t.totalDespesas);

            var resumoGeral = new
            {
                totalReceitas = resumoReceitas,
                totalDespesas = resumoDespesas,
                saldoLiquido = resumoReceitas - resumoDespesas
            };

            return Ok(new
            {
                pessoas = totaisPessoas,
                resumoGeral = resumoGeral
            });
        }
    }
}
