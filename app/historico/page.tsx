// app/historico/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";


export default function Historico() {
  const [relatos, setRelatos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function carregarRelatos() {
      try {
        if (!user) return;
        
        // Filtra apenas os relatos do usuário logado
        const q = query(
          collection(db, "relatos_suporte"), 
          where("userId", "==", user.uid),
          orderBy("data_registro", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRelatos(docs);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarRelatos();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Meu Histórico</h1>
              <Link href="/" className="text-blue-600 hover:underline">← Novo Registro</Link>
            </div>

            {carregando ? (
              <p>Carregando registros...</p>
            ) : relatos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Nenhum registro encontrado.</p>
                <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
                  Criar seu primeiro registro
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {relatos.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">
                        {item.categoria}
                      </span>
                      <span className={`text-sm font-bold ${item.gravidade_estimada >= 4 ? 'text-red-500' : 'text-gray-400'}`}>
                        Nível: {item.gravidade_estimada}
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-2">{item.resumo}</h2>
                    <p className="text-gray-600 text-sm mb-4 italic">"{item.relato_original}"</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.palavras_chave?.map((tag: string) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}