"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import SideBar from "@/app/components/SideBar";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  ComputerDesktopIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShareIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function DetalhesRelato() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [relato, setRelato] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    async function carregarDetalhes() {
      if (!user || !id) return;

      try {
        const docRef = doc(db, "relatos_suporte", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          if (dados.userId === user.uid) {
            setRelato({ id: docSnap.id, ...dados });
          } else {
            alert("Acesso negado.");
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao carregar o relato:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDetalhes();
  }, [id, user, router]);

  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getGravidadeInfo = (nivel: number) => {
    if (nivel >= 4) return { cor: "bg-red-100 text-red-700 border-red-200", icone: "🔴", label: "Crítico", bgGradiente: "from-red-500 to-red-600" };
    if (nivel >= 3) return { cor: "bg-orange-100 text-orange-700 border-orange-200", icone: "🟠", label: "Alto", bgGradiente: "from-orange-500 to-orange-600" };
    if (nivel >= 2) return { cor: "bg-yellow-100 text-yellow-700 border-yellow-200", icone: "🟡", label: "Médio", bgGradiente: "from-yellow-500 to-yellow-600" };
    return { cor: "bg-green-100 text-green-700 border-green-200", icone: "🟢", label: "Baixo", bgGradiente: "from-green-500 to-green-600" };
  };

  if (carregando) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
          <SideBar />
          {/* ml-0 no mobile, ml-64 no desktop */}
          <div className="flex-1 md:ml-64 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando análise...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!relato) return null;
  const gravidadeInfo = getGravidadeInfo(relato.gravidade_estimada);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <SideBar />
        
        {/* Ajuste de margem responsiva e padding superior para não cobrir o botão hamburguer no mobile */}
        <main className="flex-1 md:ml-64 w-full pt-16 md:pt-0 overflow-x-hidden">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 max-w-7xl">
            
            {/* Breadcrumb e Ações - Stack vertical no mobile */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-3">
                <Link 
                  href="/historico" 
                  className="flex items-center w-fit gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-200 text-sm"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Voltar</span>
                </Link>
                
                <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 overflow-hidden">
                  <span className="shrink-0">Análises</span>
                  <span>/</span>
                  <span className="text-gray-800 font-medium truncate">
                    {relato.categoria}
                  </span>
                </nav>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><ShareIcon className="h-5 w-5" /></button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><PrinterIcon className="h-5 w-5" /></button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><DocumentArrowDownIcon className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
              <div className={`h-2 bg-gradient-to-r ${gravidadeInfo.bgGradiente}`} />
              
              <div className="p-4 md:p-8">
                {/* Título e Botão Nova Análise */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${gravidadeInfo.cor} flex items-center gap-1`}>
                        {gravidadeInfo.icone} {gravidadeInfo.label}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                        {relato.sentimento_cliente || 'Neutro'}
                      </span>
                    </div>
                    
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight">
                      {relato.resumo_tecnico || 'Análise de Suporte'}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" /> {formatarData(relato.data_registro)}</span>
                      {relato.sistema_afetado && (
                        <span className="flex items-center gap-1.5"><ComputerDesktopIcon className="h-4 w-4" /> {relato.sistema_afetado}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all text-sm font-semibold w-full lg:w-auto"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <span>Nova Análise</span>
                  </Link>
                </div>

                {/* Abas - Com scroll horizontal no mobile */}
                <div className="border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                  <nav className="flex gap-4 md:gap-8 min-w-max">
                    {[
                      { id: 'detalhes', label: 'Detalhes', icon: ClipboardDocumentListIcon },
                      { id: 'solucoes', label: 'Soluções', icon: WrenchScrewdriverIcon },
                      { id: 'analise', label: 'Técnico', icon: LightBulbIcon }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 px-1 font-medium text-sm transition-all relative flex items-center gap-2 ${
                          activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Conteúdo das Abas */}
                <div className="mt-6">
                  {activeTab === 'detalhes' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" /> Relato Original
                          </h3>
                          <p className="text-gray-700 text-sm italic leading-relaxed bg-white p-4 rounded-lg border border-gray-100">
                            "{relato.relato_original}"
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4 md:p-6 border border-purple-200">
                          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                            <SparklesIcon className="h-5 w-5 text-purple-600" /> Resumo IA
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-lg border border-purple-100">
                            {relato.resumo_tecnico || relato.resumo}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                            <TagIcon className="h-5 w-5 text-gray-500" /> Classificação
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">{relato.categoria}</span>
                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-200">{relato.tipo_solicitacao}</span>
                          </div>
                        </div>

                        {relato.palavras_chave?.length > 0 && (
                          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                              <TagIcon className="h-5 w-5 text-gray-500" /> Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {relato.palavras_chave.map((tag: string) => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">#{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'solucoes' && (
                    <div className="space-y-6">
                      {relato.passos_para_reproducao?.length > 0 && (
                        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                            <ClipboardDocumentListIcon className="h-5 w-5 text-orange-500" /> Reprodução
                          </h3>
                          <ol className="space-y-3">
                            {relato.passos_para_reproducao.map((passo: string, idx: number) => (
                              <li key={idx} className="flex gap-3 text-sm text-gray-700">
                                <span className="shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                                {passo}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {relato.acao_imediata_sugerida && (
                        <div className="bg-green-50 rounded-xl p-4 md:p-6 border border-green-200">
                          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                            <WrenchScrewdriverIcon className="h-5 w-5 text-green-600" /> Ação Sugerida
                          </h3>
                          <p className="text-gray-700 text-sm bg-white p-4 rounded-lg border border-green-100">{relato.acao_imediata_sugerida}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'analise' && (
                    <div className="space-y-6">
                      {relato.hipotese_causa_raiz && (
                        <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
                          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                            <LightBulbIcon className="h-5 w-5 text-blue-600" /> Causa Raiz
                          </h3>
                          <p className="text-gray-700 text-sm bg-white p-4 rounded-lg border border-blue-100">{relato.hipotese_causa_raiz}</p>
                        </div>
                      )}

                      <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                          <ComputerDesktopIcon className="h-5 w-5 text-gray-500" /> Dados Técnicos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Sistema</p>
                            <p className="text-sm font-medium">{relato.sistema_afetado || 'N/A'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Impacto</p>
                            <p className="text-sm font-medium">{relato.sentimento_cliente || 'Neutro'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ações Rápidas - Grid 1 col mobile / 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Baixar PDF', icon: DocumentArrowDownIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'Enviar análise', icon: ShareIcon, color: 'text-green-600', bg: 'bg-green-100' },
                { label: 'Versão Impressa', icon: PrinterIcon, color: 'text-purple-600', bg: 'bg-purple-100' }
              ].map((acao, i) => (
                <button key={i} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all flex items-center gap-3">
                  <div className={`p-2 ${acao.bg} rounded-lg`}><acao.icon className={`h-5 w-5 ${acao.color}`} /></div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ação</p>
                    <p className="text-sm font-medium text-gray-800">{acao.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}