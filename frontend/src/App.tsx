import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5093/api';

interface Pessoa {
  id: string;
  nome: string;
  idade: number;
}

interface Transacao {
  id?: string;
  descricao: string;
  valor: number;
  tipo: number;
  pessoaId: string;
}

interface TotaisPessoa {
  id: string;
  nome: string;
  idade: number;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface ResumoGeral {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
}

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [totaisPessoas, setTotaisPessoas] = useState<TotaisPessoa[]>([]);
  const [resumo, setResumo] = useState<ResumoGeral>({ totalReceitas: 0, totalDespesas: 0, saldoLiquido: 0 });

  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<number>(0);
  const [pessoaId, setPessoaId] = useState('');

  const [mensagemErro, setMensagemErro] = useState('');

  const pessoaSelecionada = pessoas.find((p) => p.id.toLowerCase() === pessoaId.toLowerCase());
  const isMenorDeIdade = pessoaSelecionada ? pessoaSelecionada.idade < 18 : false;

  const carregarDados = async () => {
    try {
      const timestamp = new Date().getTime();
      const [resPessoas, resTotais, resTransacoes] = await Promise.all([
        axios.get(`${API_URL}/Pessoas?t=${timestamp}`),
        axios.get(`${API_URL}/Pessoas/Totais?t=${timestamp}`),
        axios.get(`${API_URL}/Transacoes?t=${timestamp}`)
      ]);

      setPessoas(resPessoas.data || []);
      setTotaisPessoas(resTotais.data.pessoas || []);
      setResumo(resTotais.data.resumoGeral || { totalReceitas: 0, totalDespesas: 0, saldoLiquido: 0 });
      setTransacoes(resTransacoes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handlePessoaChange = (idSelecionado: string) => {
    setPessoaId(idSelecionado);
    const p = pessoas.find((item) => item.id.toLowerCase() === idSelecionado.toLowerCase());
    if (p && p.idade < 18) {
      setTipo(0);
    }
  };

  const cadastrarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');
    if (!nome || !idade) {
      setMensagemErro('Preencha nome e idade da pessoa.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/Pessoas`, {
        nome,
        idade: parseInt(idade, 10),
      });

      setPessoas((prev) => [...prev, res.data]);
      setNome('');
      setIdade('');

      await carregarDados();
    } catch (err: any) {
      setMensagemErro(err.response?.data || 'Erro ao cadastrar pessoa.');
    }
  };

  const cadastrarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');

    if (!descricao || !valor || !pessoaId) {
      setMensagemErro('Preencha todos os campos da transação.');
      return;
    }

    const valorNumerico = parseFloat(valor);
    const tipoNumerico = Number(tipo);

    if (isMenorDeIdade && tipoNumerico === 1) {
      setMensagemErro('Pessoas menores de 18 anos não podem registrar Receitas.');
      return;
    }

    try {
      await axios.post(`${API_URL}/Transacoes`, {
        descricao,
        valor: valorNumerico,
        tipo: tipoNumerico,
        pessoaId,
      });

      setDescricao('');
      setValor('');
      setPessoaId('');
      setTipo(0);

      await carregarDados();
    } catch (err: any) {
      setMensagemErro(err.response?.data || 'Erro ao cadastrar transação.');
    }
  };

  const deletarPessoa = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/Pessoas/${id}`);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao deletar pessoa:', err);
    }
  };

  const obterNomePessoa = (id: string) => {
    const p = pessoas.find((item) => item.id.toLowerCase() === id.toLowerCase());
    return p ? p.nome : 'Desconhecido';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto' }}>
      <h1>Controle de Gastos Residenciais</h1>

      {mensagemErro && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccc', color: '#990000', marginBottom: '15px', borderRadius: '4px' }}>
          {mensagemErro}
        </div>
      )}

      {/* 1. CADASTRO DE PESSOA */}
      <section style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>1. Cadastrar Pessoa</h2>
        <form onSubmit={cadastrarPessoa} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="number"
            placeholder="Idade"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            style={{ width: '80px', padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Cadastrar</button>
        </form>
      </section>

      {/* 2. CADASTRO DE TRANSAÇÃO */}
      <section style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>2. Cadastrar Transação</h2>
        <form onSubmit={cadastrarTransacao} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Descrição (ex: Mercado, Mesada)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{ padding: '8px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />

            <select
              value={pessoaId}
              onChange={(e) => handlePessoaChange(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            >
              <option value="">Selecione uma Pessoa</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.idade} anos)
                </option>
              ))}
            </select>

            <select
              value={tipo}
              onChange={(e) => setTipo(Number(e.target.value))}
              style={{ padding: '8px', flex: 1 }}
            >
              <option value={0}>Despesa</option>
              <option value={1} disabled={isMenorDeIdade}>
                {isMenorDeIdade ? 'Receita (Bloqueado < 18 anos)' : 'Receita'}
              </option>
            </select>
          </div>

          {isMenorDeIdade && (
            <small style={{ color: '#d9534f', fontStyle: 'italic' }}>
              * Esta pessoa é menor de 18 anos. Apenas despesas são permitidas conforme regra de negócio.
            </small>
          )}

          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Salvar Transação
          </button>
        </form>
      </section>

      {/* 3. TOTAIS POR PESSOA */}
      <section style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
        <h2>3. Totais por Pessoa</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th>Nome</th>
              <th>Idade</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {totaisPessoas.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{p.nome}</td>
                <td>{p.idade}</td>
                <td style={{ color: 'green' }}>R$ {p.totalReceitas.toFixed(2)}</td>
                <td style={{ color: 'red' }}>R$ {p.totalDespesas.toFixed(2)}</td>
                <td style={{ fontWeight: 'bold' }}>R$ {p.saldo.toFixed(2)}</td>
                <td>
                  <button onClick={() => deletarPessoa(p.id)} style={{ color: 'red', cursor: 'pointer' }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Resumo Geral da Residência</h3>
          <p>Total Receitas: <strong style={{ color: 'green' }}>R$ {resumo.totalReceitas.toFixed(2)}</strong></p>
          <p>Total Despesas: <strong style={{ color: 'red' }}>R$ {resumo.totalDespesas.toFixed(2)}</strong></p>
          <p>Saldo Líquido: <strong>R$ {resumo.saldoLiquido.toFixed(2)}</strong></p>
        </div>
      </section>

      {/* 4. TRANSAÇÕES CADASTRADAS */}
      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        <h2>4. Transações Cadastradas</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th>Descrição</th>
              <th>Pessoa</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '10px', color: '#777' }}>
                  Nenhuma transação cadastrada ainda.
                </td>
              </tr>
            ) : (
              transacoes.map((t, idx) => (
                <tr key={t.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{t.descricao}</td>
                  <td>{obterNomePessoa(t.pessoaId)}</td>
                  <td>{Number(t.tipo) === 1 ? 'Receita' : 'Despesa'}</td>
                  <td style={{ color: Number(t.tipo) === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
                    R$ {Number(t.valor).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
