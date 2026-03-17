"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Link from "next/link";
import SideBar from "../components/SideBar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { 
  CalendarIcon, 
  TagIcon, 
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Definição de tipos para melhorar a legibilidade
interface Relato {
  id: string;
  resumo_tecnico: string;
  sistema_afetado?: string;
  gravidade_estimada: number;
  sentimento_cliente: string;
  categoria: string;
  subcategoria: string;
  tipo_solicitacao: string;
  relato_original: string;
  palavras_chave?: string[];
  passos_para_reproducao?: string[];
  hipotese_causa_raiz?: string;
  acao_imediata_sugerida?: string;
  data_registro?: any;
}

// Componente de Badge para categorias
const CategoryBadge = ({ children, color = "blue" }: { children: React.ReactNode; color?: string }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[color as keyof typeof colors] || colors.blue}`}>
      {children}
    </span>
  );
};

// Componente de Gravidade com ícone
const GravidadeIndicator = ({ nivel }: { nivel: number }) => {
  const getGravidadeInfo = (nivel: number) => {
    if (nivel >= 4) return { label: "Crítica", color: "bg-red-100 text-red-700 border-red-200", icon: "🔴" };
    if (nivel >= 3) return { label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🟠" };
    if (nivel >= 2) return { label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "🟡" };
    return { label: "Baixa", color: "bg-green-100 text-green-700 border-green-200", icon: "🟢" };
  };

  const info = getGravidadeInfo(nivel);

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${info.color} flex items-center gap-1.5`}>
      <span>{info.icon}</span>
      <span>{info.label} (Nível {nivel})</span>
    </span>
  );
};

export default function Historico() {
  const [relatos, setRelatos] = useState<Relato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroGravidade, setFiltroGravidade] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function carregarRelatos() {
      try {
        if (!user) return;

        const q = query(
          collection(db, "relatos_suporte"),
          where("userId", "==", user.uid),
          orderBy("data_registro", "desc")
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Relato[];
        
        setRelatos(docs);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setCarregando(false);
      }
    }
    carregarRelatos();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filtrar relatos por gravidade
  const relatosFiltrados = filtroGravidade 
    ? relatos.filter(r => r.gravidade_estimada === filtroGravidade)
    : relatos;

  // Estatísticas rápidas
  const totalRelatos = relatos.length;
  const relatosCriticos = relatos.filter(r => r.gravidade_estimada >= 4).length;

  if (carregando) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
          <SideBar />
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex">
          <SideBar />
        <div className="min-h-screen flex-1 ml-0 md:ml-64 pt-16 md:pt-0 overflow-y-auto bg-linear-to-br from-gray-50 via-white to-gray-50">
          
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              
              {/* Header com estatísticas */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                  <div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Meu Histórico
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      Acompanhe todos os seus registros de suporte
                    </p>
                  </div>
                  <Link 
                    href="/" 
                    className="group flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <DocumentTextIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">Novo Registro</span>
                  </Link>
                </div>

                {/* Cards de estatísticas */}
                {totalRelatos > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total de Registros</p>
                          <p className="text-2xl font-bold text-gray-800">{totalRelatos}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Casos Críticos</p>
                          <p className="text-2xl font-bold text-gray-800">{relatosCriticos}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <TagIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Categorias</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {new Set(relatos.map(r => r.categoria)).size}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filtros rápidos */}
              {totalRelatos > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroGravidade(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filtroGravidade === null
                        ? 'bg-gray-800 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {[1, 2, 3, 4, 5].map(nivel => (
                    <button
                      key={nivel}
                      onClick={() => setFiltroGravidade(nivel)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filtroGravidade === nivel
                          ? nivel >= 4 
                            ? 'bg-red-600 text-white shadow-md' 
                            : nivel === 3
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-yellow-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Nível {nivel}
                    </button>
                  ))}
                </div>
              )}

              {/* Lista de relatos */}
              {relatosFiltrados.length === 0 ? (
                <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                  <div className="max-w-sm mx-auto">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">
                      {relatos.length === 0 
                        ? "Nenhum registro encontrado." 
                        : "Nenhum registro com este filtro."}
                    </p>
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-100 transition-all"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                      Criar seu primeiro registro
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatosFiltrados.map((item, index) => (
                    <div
                      key={item.id}
                      className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Card Header */}
                      <div
                        className="relative cursor-pointer"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {/* Barra de gravidade lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          item.gravidade_estimada >= 4 ? 'bg-linear-to-b from-red-500 to-red-600' :
                          item.gravidade_estimada >= 3 ? 'bg-linear-to-b from-orange-500 to-orange-600' :
                          'bg-linear-to-b from-yellow-500 to-yellow-600'
                        }`} />

                        <div className="pl-4 p-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {item.resumo_tecnico}
                              </h2>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-3">
                                <GravidadeIndicator nivel={item.gravidade_estimada} />
                                
                                <CategoryBadge color={
                                  item.sentimento_cliente === 'Positivo' ? 'green' :
                                  item.sentimento_cliente === 'Negativo' ? 'red' : 'orange'
                                }>
                                  {item.sentimento_cliente}
                                </CategoryBadge>

                                {item.sistema_afetado && (
                                  <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                    <CircleStackIcon className="h-3.5 w-3.5" />
                                    {item.sistema_afetado}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                {expandedId === item.id ? (
                                  <ChevronUpIcon className="h-6 w-6" />
                                ) : (
                                  <ChevronDownIcon className="h-6 w-6" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tags rápidas */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                              {item.categoria} / {item.subcategoria}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                              {item.tipo_solicitacao}
                            </span>
                            {item.palavras_chave?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Body (expandido) */}
                      {expandedId === item.id && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-slideDown">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Coluna Esquerda - Detalhes do Problema */}
                            <div className="space-y-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                                  Relato Original
                                </h3>
                                <p className="text-gray-600 italic bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                                  "{item.relato_original}"
                                </p>
                              </div>

                              {item.passos_para_reproducao && item.passos_para_reproducao.length > 0 && (
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <BeakerIcon className="h-5 w-5 text-purple-500" />
                                    Passos para Reprodução
                                  </h3>
                                  <ol className="list-decimal list-inside space-y-2">
                                    {item.passos_para_reproducao.map((passo, idx) => (
                                      <li key={idx} className="text-gray-600 text-sm bg-purple-50/30 p-2 rounded">
                                        {passo}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>

                            {/* Coluna Direita - Soluções e Análises */}
                            <div className="space-y-4">
                              {item.hipotese_causa_raiz && (
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="h-5 w-5 text-green-500" />
                                    Hipótese de Causa Raiz
                                  </h3>
                                  <p className="text-gray-600 bg-green-50/50 p-3 rounded-lg border border-green-100">
                                    {item.hipotese_causa_raiz}
                                  </p>
                                </div>
                              )}

                              {item.acao_imediata_sugerida && (
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                                    Ação Imediata Sugerida
                                  </h3>
                                  <p className="text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                    {item.acao_imediata_sugerida}
                                  </p>
                                </div>
                              )}

                              {/* Todas as palavras-chave */}
                              {item.palavras_chave && item.palavras_chave.length > 0 && (
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <TagIcon className="h-5 w-5 text-gray-500" />
                                    Todas as Tags
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                    {item.palavras_chave.map(tag => (
                                      <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
            opacity: 0;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
    </ProtectedRoute>
  );
}