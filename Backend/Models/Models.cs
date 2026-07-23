using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public enum TipoTransacao
    {
        Despesa = 0,
        Receita = 1
    }

    public class Pessoa
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Nome { get; set; } = string.Empty;
        public int Idade { get; set; }
        
        [JsonIgnore]
        public List<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }

    public class Transacao
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public TipoTransacao Tipo { get; set; }
        public string PessoaId { get; set; } = string.Empty;

        [JsonIgnore]
        public Pessoa? Pessoa { get; set; }
    }

    public static class DadosBanco
    {
        public static List<Pessoa> Pessoas { get; set; } = new List<Pessoa>();
        public static List<Transacao> Transacoes { get; set; } = new List<Transacao>();
    }
}
