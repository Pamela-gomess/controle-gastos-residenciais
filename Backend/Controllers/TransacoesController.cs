using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesController : ControllerBase
    {
        // GET: api/Transacoes
        [HttpGet]
        public async Task<IActionResult> GetTransacoes()
        {
            using var db = new AppDbContext();
            db.Database.EnsureCreated();
            var transacoes = await db.Transacoes.ToListAsync();
            return Ok(transacoes);
        }

        // POST: api/Transacoes
        [HttpPost]
        public async Task<IActionResult> CriarTransacao([FromBody] Transacao transacao)
        {
            using var db = new AppDbContext();
            db.Database.EnsureCreated();

            var pessoa = await db.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("A pessoa informada não existe no cadastro.");
            }

            // Regra de negócio do desafio: Menores de 18 anos só podem registrar Despesas
            if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
            {
                return BadRequest("Menores de 18 anos só podem ter transações do tipo Despesa.");
            }

            if (transacao.Valor <= 0)
            {
                return BadRequest("O valor da transação deve ser maior que zero.");
            }

            transacao.Id = Guid.NewGuid().ToString();
            db.Transacoes.Add(transacao);
            await db.SaveChangesAsync();

            return Ok(transacao);
        }
    }
}
