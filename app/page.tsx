"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import SideBar from "./components/SideBar";
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
          Authorization: `Bearer ${token}`,
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
      "Ready when you are.",
    ];
    const indice = Math.floor(Math.random() * frases.length);
    return frases[indice];
  }

  useEffect(() => {
    setFrase(getFraseDinamica());
  }, []);

  return (
    <ProtectedRoute>
      {/* Adicionado relative e min-h-screen para garantir que ocupe a tela toda corretamente */}
      <section className="flex relative min-h-screen overflow-hidden">
        <SideBar />
        
        {/* 1. Trocado ml-80 por md:ml-80 (margin-left apenas em telas maiores).
          2. Adicionado p-4 md:p-8 para dar respiro nas bordas em dispositivos móveis.
          3. flex-col garantido para empilhar o conteúdo.
        */}
        <div className="flex-1 flex flex-col w-full ml-0 md:ml-64 p-4 md:p-8 overflow-y-auto">
          
          <div className="flex justify-center w-full mb-6">
            {/* Trocado img-fluid (classe do Bootstrap) pelas classes equivalentes do Tailwind */}
            <img 
              src="/wall-e.png" 
              className="max-w-[200px] md:max-w-xs h-auto object-contain" 
              alt="wall-e" 
            />
          </div>

          {/* O estilo inline fixo (34px) foi passado para o Tailwind para reduzir no mobile e manter o tamanho original no desktop */}
          <p className="text-2xl md:text-[34px] font-bold text-center md:text-left mb-4">
            {frase}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 w-full max-w-4xl mx-auto md:mx-0">
            <textarea
              className="w-full h-40 md:h-48 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva aqui o erro ocorrido, o que você estava fazendo, mensagens exibidas, etc..."
              value={relato}
              onChange={(e) => setRelato(e.target.value)}
            />

            <button
              type="submit"
              disabled={carregando}
              className={`w-full py-3 rounded-lg font-semibold text-white transition
                ${
                  carregando
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
}