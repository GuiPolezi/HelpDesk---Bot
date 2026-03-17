"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import Link from "next/link";

export default function SideBar() {
  const { user, logout } = useAuth();
  const [analises, setAnalises] = useState<any[]>([]);
  // Novo estado para controlar o menu no mobile
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "relatos_suporte"),
      where("userId", "==", user.uid),
      orderBy("data_registro", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnalises(docs);
    });

    return () => unsubscribe();
  }, [user]);

  // Função para fechar o menu ao clicar em um link (útil no mobile)
  const fecharMenu = () => setIsOpen(false);

  return (
    <>
      {/* Botão Hambúrguer (Aparece apenas no Mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-700 transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay Escuro (Fundo transparente no mobile quando o menu está aberto) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={fecharMenu}
        />
      )}

      {/* Sidebar Principal */}
      <div className={`
        w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Histórico de Análises
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {analises.length} {analises.length === 1 ? 'análise' : 'análises'}
            </p>
          </div>
          
          {/* Botão de Fechar "X" (Aparece apenas no Mobile dentro do menu) */}
          <button 
            onClick={fecharMenu} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Lista com scroll interno */}
        <div className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {analises.length === 0 ? (
              <li className="text-gray-500 text-sm px-3 py-2 text-center">
                Nenhuma análise ainda.
              </li>
            ) : (
              analises.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={`/relatos/${item.id}`} 
                    onClick={fecharMenu}
                    className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md truncate transition"
                    title={item.categoria || "Análise"}
                  >
                    💬 {item.categoria || "Análise sem título"}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <Link href="/historico" onClick={fecharMenu} className="bg-amber-300 hover:bg-amber-700 text-black px-4 py-2 rounded-lg block text-center mb-4 transition w-full">Acessar Histórico</Link>
          <Link
            href="/" 
            onClick={fecharMenu}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg block text-center mb-4 transition w-full"
          >
            + Nova Análise
          </Link>
          <button 
            onClick={() => { fecharMenu(); logout(); }} 
            className="bg-red-500 hover:bg-red-600 py-2 text-white rounded-lg text-sm w-full transition"
          >
            Sair
          </button>
        </div>
      </div>
    </>
  );
}