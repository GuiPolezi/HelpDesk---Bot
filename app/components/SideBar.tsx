"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase"; // Ajuste o caminho se necessário
import Link from "next/link";

export default function SideBar() {
  const { user } = useAuth();
  const [analises, setAnalises] = useState<any[]>([]);

useEffect(() => {
    // Se não tiver usuário logado, não faz nada
    if (!user) return;

    // Cria a query para buscar apenas as análises deste usuário
    const q = query(
      collection(db, "relatos_suporte"),
      where("userId", "==", user.uid),
      orderBy("data_registro", "desc")
    );

    // onSnapshot atualiza a sidebar em tempo real sempre que um novo relato for salvo
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnalises(docs);
    });

    // Limpa o listener quando o componente for desmontado
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        {/* Botão para criar uma nova análise (leva para a Home) */}
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg block text-center mb-4 transition"
        >
          + Nova Análise
        </Link>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Histórico de Análises
        </h2>
      </div>
      
      {/* Área com scroll para a lista de itens */}
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {analises.length === 0 ? (
            <li className="text-gray-500 text-sm px-3 py-2 text-center">
              Nenhuma análise ainda.
            </li>
          ) : (
            analises.map((item) => (
              <li key={item.id}>
                {/* O Link aponta para uma página dinâmica usando o ID do relato */}
                <Link 
                  href={`/relatos/${item.id}`} 
                  className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md truncate transition"
                  title={item.resumo || "Análise"} // Mostra o texto completo se passar o mouse por cima
                >
                  {/* Usa o resumo como título na sidebar. A classe "truncate" corta textos muito longos com "..." */}
                  💬 {item.categoria || "Análise sem título"}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}