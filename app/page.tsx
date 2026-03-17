"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  const [relato, setRelato] = useState("");
   const [frase, setFrase] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!relato.trim()) return;

    try {
      setCarregando(true);

      // Pega o token do usuário logado
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/analisar", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ relato }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      console.log("Salvo no banco com sucesso:", data);
      alert(`Relato salvo! Categoria definida: ${data.dados.categoria}`);

      setRelato("");
    } catch (error) {
      console.error("Erro no envio:", error);
      alert("Erro ao processar o relato. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }
  function getFraseDinamica() {
              const frases = [
                  "Good to see you",
                  "Where should we begin?",
                  "What’s on your mind today?",
                  "What’s on the agenda today?",
                  "Ready when you are."
              ];
              const indice = Math.floor(Math.random() * frases.length);
              return frases[indice];
          }
  
      useEffect(() => {
          setFrase(getFraseDinamica());
      }, []);
   return (
    <ProtectedRoute>
          <section style={{height: "93vh"}}>
              <Navbar />
              <div className="container text-center mx-auto flex flex-col justify-center h-full">
                  <div className="image flex justify-center">
                      <img src="/wall-e.png" className="img-fluid" alt="wall-e" />
                  </div>
                  <p style={{fontSize: "34px", fontWeight: "bold"}}>
                      {frase}
                  </p>
                      
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-10">
                      <textarea
                          className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Descreva aqui o erro ocorrido, o que você estava fazendo, mensagens exibidas, etc..."
                          value={relato}
                          onChange={(e) => setRelato(e.target.value)}
                      />
  
                      <button
                          type="submit"
                          disabled={carregando}
                          className={`w-full py-3 rounded-lg font-semibold text-white transition
                          ${carregando
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                          {carregando ? "Analisando..." : "Analisar e Salvar"}
                      </button>
                  </form>
              </div>
          </section>
          </ProtectedRoute>
      );
/*
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              Registro de Erros do Dia
            </h1>

            <p className="text-gray-600 mb-6">
              Descreva abaixo o erro ou problema ocorrido no sistema.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea
                className="w-full h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva aqui o erro ocorrido, o que você estava fazendo, mensagens exibidas, etc..."
                value={relato}
                onChange={(e) => setRelato(e.target.value)}
              />

              <button
                type="submit"
                disabled={carregando}
                className={`w-full py-3 rounded-lg font-semibold text-white transition
                ${carregando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {carregando ? "Analisando..." : "Analisar e Salvar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
  */
}