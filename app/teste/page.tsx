"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { auth } from "@/firebase";

export default function Teste() {
    const [relato, setRelato] = useState("");
      const [carregando, setCarregando] = useState(false);
    const [frase, setFrase] = useState("");
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
    )
}