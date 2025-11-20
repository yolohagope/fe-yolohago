import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  ChatCircle, 
  PaperPlaneTilt,
  User as UserIcon,
  Package,
  CheckCircle,
  Clock,
  ArrowLeft,
  DotsThree,
  Briefcase,
  CalendarBlank,
  CurrencyDollar
} from '@phosphor-icons/react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Inquiry, Task } from '@/lib/types';
import { fetchMyTasksInquiries, fetchMyInquiries, answerInquiry, createInquiry } from '@/services/api';

// Agrupador de conversaciones por tarea
interface InquiryThread {
  taskId: number;
  taskTitle: string;
  inquiries: Inquiry[];
  lastMessage: string;
  lastMessageSender: string; // Nombre del emisor del último mensaje
  lastMessageDate: string;
  unreadCount: number;
  isMyTask: boolean; // Si soy el publicador
}

export function Inbox() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tabs: 'consultas' o 'trabajos'
  const activeTab = searchParams.get('tab') || 'consultas';
  const selectedThreadId = searchParams.get('thread');
  
  // Estado para Consultas
  const [myTasksInquiries, setMyTasksInquiries] = useState<Inquiry[]>([]);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [inquiryThreads, setInquiryThreads] = useState<InquiryThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<InquiryThread | null>(null);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  
  // Estado para enviar mensajes
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Estado para Trabajos activos (placeholder)
  const [activeWorks] = useState<any[]>([]);

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    // Agrupar inquiries en threads
    const allInquiries = [...myTasksInquiries, ...myInquiries];
    console.log('🔄 Agrupando inquiries en threads...');
    console.log('  - Total de inquiries:', allInquiries.length);
    console.log('  - Consultas a mis tareas:', myTasksInquiries.length);
    console.log('  - Mis consultas:', myInquiries.length);
    
    const threads = groupInquiriesIntoThreads(allInquiries);
    console.log('  - Threads creados:', threads.length);
    
    if (threads.length > 0) {
      console.log('  - Ejemplo de thread:', {
        taskId: threads[0].taskId,
        taskTitle: threads[0].taskTitle,
        lastMessage: threads[0].lastMessage?.substring(0, 50),
        lastMessageSender: threads[0].lastMessageSender,
        unreadCount: threads[0].unreadCount,
        isMyTask: threads[0].isMyTask,
        inquiriesCount: threads[0].inquiries.length
      });
    }
    
    setInquiryThreads(threads);
    
    // Seleccionar thread si hay uno en la URL
    if (selectedThreadId && threads.length > 0) {
      const thread = threads.find(t => t.taskId.toString() === selectedThreadId);
      if (thread) {
        console.log('  - Thread seleccionado desde URL:', thread.taskId);
        setSelectedThread(thread);
      }
    }
  }, [myTasksInquiries, myInquiries, selectedThreadId]);

  async function loadInquiries() {
    try {
      setLoadingInquiries(true);
      const [myTasksData, myInquiriesData] = await Promise.all([
        fetchMyTasksInquiries(), // Consultas a mis tareas
        fetchMyInquiries() // Mis consultas
      ]);
      
      console.log('📋 Inbox - Datos cargados:');
      console.log('  - Consultas a mis tareas:', myTasksData.length);
      console.log('  - Mis consultas:', myInquiriesData.length);
      
      if (myTasksData.length > 0) {
        console.log('  - Ejemplo de consulta a mi tarea:', {
          id: myTasksData[0].id,
          task: myTasksData[0].task,
          task_title: myTasksData[0].task_title,
          sender_name: myTasksData[0].sender_name,
          inquirer_name: myTasksData[0].inquirer_name,
          question: myTasksData[0].question?.substring(0, 50),
          answer: myTasksData[0].answer?.substring(0, 50),
          is_answered: myTasksData[0].is_answered
        });
      }
      
      if (myInquiriesData.length > 0) {
        console.log('  - Ejemplo de mi consulta:', {
          id: myInquiriesData[0].id,
          task: myInquiriesData[0].task,
          task_title: myInquiriesData[0].task_title,
          question: myInquiriesData[0].question?.substring(0, 50),
          answer: myInquiriesData[0].answer?.substring(0, 50),
          is_answered: myInquiriesData[0].is_answered
        });
      }
      
      setMyTasksInquiries(myTasksData);
      setMyInquiries(myInquiriesData);
    } catch (error: any) {
      console.error('❌ Error loading inquiries:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoadingInquiries(false);
    }
  }

  function groupInquiriesIntoThreads(inquiries: Inquiry[]): InquiryThread[] {
    const threadsMap = new Map<number, InquiryThread>();
    
    inquiries.forEach(inquiry => {
      const taskId = inquiry.task;
      
      if (!threadsMap.has(taskId)) {
        threadsMap.set(taskId, {
          taskId,
          taskTitle: inquiry.task_title || `Tarea #${taskId}`,
          inquiries: [],
          lastMessage: '',
          lastMessageSender: '',
          lastMessageDate: inquiry.created_at,
          unreadCount: 0,
          isMyTask: false
        });
      }
      
      const thread = threadsMap.get(taskId)!;
      thread.inquiries.push(inquiry);
      
      // Determinar el último mensaje y su emisor
      const lastMessageDate = inquiry.answered_at || inquiry.created_at;
      if (lastMessageDate > thread.lastMessageDate) {
        thread.lastMessageDate = lastMessageDate;
        // Si hay respuesta, es el último mensaje
        if (inquiry.answer && inquiry.answered_at) {
          thread.lastMessage = inquiry.answer;
          thread.lastMessageSender = 'Tú';
        } else {
          thread.lastMessage = inquiry.question;
          thread.lastMessageSender = inquiry.sender_name || inquiry.inquirer_name || 'Usuario';
        }
      }
      
      // Contar no leídos (consultas sin responder si soy publicador)
      if (!inquiry.is_answered) {
        thread.unreadCount++;
      }
    });
    
    // Detectar si soy el publicador (comparar con myTasksInquiries)
    threadsMap.forEach(thread => {
      const isMyTask = myTasksInquiries.some(inq => inq.task === thread.taskId);
      thread.isMyTask = isMyTask;
    });
    
    // Ordenar por fecha más reciente
    return Array.from(threadsMap.values()).sort((a, b) => 
      new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
    );
  }

  function handleThreadClick(thread: InquiryThread) {
    setSelectedThread(thread);
    setSearchParams({ tab: activeTab, thread: thread.taskId.toString() });
  }

  function handleBackToList() {
    setSelectedThread(null);
    setSearchParams({ tab: activeTab });
  }

  async function handleSendMessage() {
    if (!selectedThread || !newMessage.trim()) return;
    
    try {
      setSending(true);
      
      if (selectedThread.isMyTask) {
        // Soy el publicador, responder a la última consulta sin responder
        const unanswered = selectedThread.inquiries.find(inq => !inq.is_answered);
        if (unanswered) {
          await answerInquiry(unanswered.id, { answer: newMessage.trim() });
        }
      } else {
        // Soy el consultante, hacer nueva pregunta
        await createInquiry({
          task: selectedThread.taskId,
          question: newMessage.trim()
        });
      }
      
      setNewMessage('');
      await loadInquiries();
    } catch (error: any) {
      alert(error.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  }

  function switchTab(tab: 'consultas' | 'trabajos') {
    setSearchParams({ tab });
    setSelectedThread(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-6 pt-24">
        {/* Header mejorado */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bandeja de entrada</h1>
          <p className="text-sm text-gray-600">
            Gestiona tus consultas y conversaciones de trabajos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar izquierdo: Lista de conversaciones */}
          <div className={`lg:col-span-4 ${selectedThread ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
              {/* Tabs de categorías */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => switchTab('consultas')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'consultas'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ChatCircle className="w-5 h-5" weight={activeTab === 'consultas' ? 'fill' : 'regular'} />
                    <span>Consultas</span>
                    {inquiryThreads.filter(t => t.unreadCount > 0).length > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {inquiryThreads.filter(t => t.unreadCount > 0).length}
                      </span>
                    )}
                  </div>
                  {activeTab === 'consultas' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
                <button
                  onClick={() => switchTab('trabajos')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'trabajos'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="w-5 h-5" weight={activeTab === 'trabajos' ? 'fill' : 'regular'} />
                    <span>Trabajos activos</span>
                  </div>
                  {activeTab === 'trabajos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              </div>

              {/* Lista de conversaciones */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'consultas' && (
                  <>
                    {loadingInquiries ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600 mx-auto mb-3"></div>
                          <p className="text-sm text-gray-500">Cargando...</p>
                        </div>
                      </div>
                    ) : inquiryThreads.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center px-8">
                          <ChatCircle weight="thin" size={56} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-sm text-gray-500">No hay consultas</p>
                        </div>
                      </div>
                    ) : (
                      inquiryThreads.map((thread, index) => (
                        <button
                          key={thread.taskId}
                          onClick={() => handleThreadClick(thread)}
                          className={`w-full text-left p-4 transition-all ${
                            selectedThread?.taskId === thread.taskId 
                              ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                              : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                          } ${index !== inquiryThreads.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                              selectedThread?.taskId === thread.taskId
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              <span className="text-base font-semibold">
                                {(thread.taskTitle || 'T').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <h3 className={`font-semibold text-sm truncate ${
                                  thread.unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'
                                }`}>
                                  {thread.taskTitle}
                                </h3>
                                <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                                  {format(new Date(thread.lastMessageDate), "d MMM", { locale: es })}
                                </span>
                              </div>
                              <p className={`text-xs truncate ${
                                thread.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'
                              }`}>
                                {thread.lastMessage}
                              </p>
                              {thread.unreadCount > 0 && (
                                <span className="inline-block mt-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {thread.unreadCount} {thread.unreadCount === 1 ? 'nuevo' : 'nuevos'}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                )}

                {activeTab === 'trabajos' && (
                  <div className="p-8 text-center">
                    <Briefcase weight="thin" size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600">No hay trabajos activos</p>
                    <p className="text-xs text-gray-500 mt-2">Próximamente disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho: Conversación */}
          <div className={`lg:col-span-8 ${selectedThread ? 'block' : 'hidden lg:block'}`}>
            {selectedThread ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-16rem)] flex flex-col overflow-hidden">
                {/* Header de la conversación */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden -ml-2"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-base font-semibold text-white">
                        {(selectedThread.taskTitle || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-base">{selectedThread.taskTitle}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedThread.isMyTask ? 'Tu consulta' : 'Consulta sobre tu tarea'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                    onClick={() => navigate(`/publicaciones/${selectedThread.taskId}`)}
                  >
                    Ver tarea
                  </Button>
                </div>

                {/* Mensajes de la conversación */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                  {selectedThread.inquiries
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((inquiry) => {
                      console.log('🔍 Inquiry:', {
                        id: inquiry.id,
                        question: inquiry.question?.substring(0, 30),
                        answer: inquiry.answer?.substring(0, 30),
                        is_sender: inquiry.is_sender,
                        is_poster: inquiry.is_poster,
                        sender_name: inquiry.sender_name
                      });
                      return (
                      <div key={inquiry.id} className="space-y-4">
                        {/* Pregunta */}
                        <div className={`flex items-start gap-3 ${inquiry.is_sender ? 'justify-end' : ''}`}>
                          {!inquiry.is_sender && (
                            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center shrink-0 mt-1">
                              <UserIcon className="w-5 h-5 text-gray-600" weight="bold" />
                            </div>
                          )}
                          <div className="flex-1 max-w-[70%]">
                            <div className={`flex items-baseline gap-2 mb-2 ${inquiry.is_sender ? 'justify-end' : ''}`}>
                              {!inquiry.is_sender && (
                                <span className="font-semibold text-sm text-gray-900">
                                  {inquiry.sender_name || inquiry.inquirer_name || 'Usuario'}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {format(new Date(inquiry.created_at), "d 'nov', HH:mm", { locale: es })}
                              </span>
                              {inquiry.is_sender && (
                                <span className="font-semibold text-sm text-gray-900">Tú</span>
                              )}
                            </div>
                            <div className={`${inquiry.is_sender ? 'bg-blue-600' : 'bg-white border border-gray-100'} rounded-2xl ${inquiry.is_sender ? 'rounded-tr-md' : 'rounded-tl-md'} px-4 py-3 shadow-sm`}>
                              <p className={`text-sm leading-relaxed ${inquiry.is_sender ? 'text-white' : 'text-gray-800'}`}>
                                {inquiry.question}
                              </p>
                            </div>
                          </div>
                          {inquiry.is_sender && (
                            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                              <UserIcon className="w-5 h-5 text-white" weight="bold" />
                            </div>
                          )}
                        </div>

                        {/* Respuesta si existe */}
                        {inquiry.answer && (
                          <div className={`flex items-start gap-3 ${inquiry.is_poster ? 'justify-end' : ''}`}>
                            {!inquiry.is_poster && (
                              <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <UserIcon className="w-5 h-5 text-gray-600" weight="bold" />
                              </div>
                            )}
                            <div className="flex-1 max-w-[70%]">
                              <div className={`flex items-baseline gap-2 mb-2 ${inquiry.is_poster ? 'justify-end' : ''}`}>
                                {!inquiry.is_poster && (
                                  <span className="font-semibold text-sm text-gray-900">
                                    {inquiry.poster_name || 'Publicador'}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {inquiry.answered_at && format(new Date(inquiry.answered_at), "d 'nov', HH:mm", { locale: es })}
                                </span>
                                {inquiry.is_poster && (
                                  <span className="font-semibold text-sm text-gray-900">Tú</span>
                                )}
                              </div>
                              <div className={`${inquiry.is_poster ? 'bg-blue-600' : 'bg-white border border-gray-100'} rounded-2xl ${inquiry.is_poster ? 'rounded-tr-md' : 'rounded-tl-md'} px-4 py-3 shadow-sm`}>
                                <p className={`text-sm leading-relaxed ${inquiry.is_poster ? 'text-white' : 'text-gray-800'}`}>
                                  {inquiry.answer}
                                </p>
                              </div>
                            </div>
                            {inquiry.is_poster && (
                              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <UserIcon className="w-5 h-5 text-white" weight="bold" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )})}
                </div>

                {/* Input para responder */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-3">
                    <Textarea
                      placeholder={
                        selectedThread.isMyTask 
                          ? "Responder pregunta..." 
                          : selectedThread.inquiries.length > 0
                            ? "Escribe otra pregunta..."
                            : "Escribe tu pregunta..."
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      rows={1}
                      className="resize-none flex-1 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-3 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="h-11 w-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-0 flex items-center justify-center shrink-0"
                    >
                      <PaperPlaneTilt className="w-5 h-5" weight="fill" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Presiona <span className="font-medium">Enter</span> para enviar, <span className="font-medium">Shift+Enter</span> para nueva línea
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-16rem)] flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatCircle weight="thin" size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Selecciona una conversación</h3>
                  <p className="text-sm text-gray-500">
                    Elige una consulta de la lista para ver el hilo completo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
