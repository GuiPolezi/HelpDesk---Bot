"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajuste a quantidade de "../" conforme sua estrutura
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute"; // Ajuste o caminho
import { useAuth } from "../../context/AuthContext"; // Ajuste o caminho
import SideBar from "@/app/components/SideBar";

export default function DetalhesRelato() {
  const { id } = useParams(); // Pega o ID que está na URL
  const router = useRouter();
  const { user } = useAuth();
  
  const [relato, setRelato] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDetalhes() {
      if (!user || !id) return;

      try {
        // Busca um documento ESPECÍFICO pelo ID
        const docRef = doc(db, "relatos_suporte", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          // Segurança extra: garante que o usuário só veja seu próprio relato
          if (dados.userId === user.uid) {
            setRelato({ id: docSnap.id, ...dados });
          } else {
            alert("Acesso negado.");
            router.push("/");
          }
        } else {
          console.log("Relato não encontrado!");
          router.push("/"); // Volta pra home se não achar
        }
      } catch (error) {
        console.error("Erro ao carregar o relato:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhes();
  }, [id, user, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50">
        <SideBar />
        
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="w-full max-w-7xl">
            
            {carregando ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-lg animate-pulse">Carregando análise...</p>
              </div>
            ) : relato ? (
              // Início do Card Individual
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                
                {/* Cabeçalho do Card */}
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {relato.categoria}
                  </span>
                </div>

                {/* Corpo do Card */}
                <div className="p-8 space-y-6">
                  
                  {/* Seção de Gravidade */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium">Nível de Gravidade:</span>
                    <div className={`px-3 py-1 rounded-md font-bold text-sm ${
                      relato.gravidade_estimada >= 4 ? "bg-red-100 text-red-700" : 
                      relato.gravidade_estimada >= 3 ? "bg-yellow-100 text-yellow-700" : 
                      "bg-green-100 text-green-700"
                    }`}>
                      {relato.gravidade_estimada} / 5
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="relatos flex gap-5">

                    {/* Relato Original do Usuário */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Relato Original
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap italic">
                            "{relato.relato_original}"
                        </p>
                        </div>
                    </div>
                    
                    {/* Relato da IA */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Relato IA</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap italic">
                            "{relato.resumo}"
                        </p>
                        </div>
                    </div>

                  </div>

                  {/* Palavras-chave */}
                  {relato.palavras_chave && relato.palavras_chave.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Tags / Palavras-chave
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {relato.palavras_chave.map((tag: string) => (
                          <span key={tag} className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
              // Fim do Card Individual
            ) : null}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}