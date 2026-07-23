using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend
{
    // Contexto do Entity Framework responsável pelo gerenciamento da base de dados SQLite
    public class AppDbContext : DbContext
    {
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Transacao> Transacoes { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // O arquivo do banco será criado automaticamente na pasta raiz do backend
            optionsBuilder.UseSqlite("Data Source=controle_gastos.db");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Exclusão em cascata: Ao deletar uma pessoa, suas transações vinculadas são apagadas
            modelBuilder.Entity<Transacao>()
                .HasOne<Pessoa>()
                .WithMany()
                .HasForeignKey(t => t.PessoaId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
