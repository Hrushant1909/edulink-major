import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { chatService } from '../../services/chatService'
import { subjectService } from '../../services/subjectService'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'
import { Circle, MessageSquare, Users, Send, ArrowLeft, Wifi, WifiOff, Search } from 'lucide-react'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from '@stomp/stompjs'

const POLL_INTERVAL_MS = 15000

export const SubjectChat = ({ mode }) => {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { getUserRole, user } = useAuth()
  const [subject, setSubject] = useState(null)
  const [loadingSubject, setLoadingSubject] = useState(true)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [input, setInput] = useState('')
  const [isDoubt, setIsDoubt] = useState(false)
  const [sending, setSending] = useState(false)
  const [participants, setParticipants] = useState(null)
  const [loadingParticipants, setLoadingParticipants] = useState(true)
  const [wsStatus, setWsStatus] = useState('connecting') // connecting, connected, offline
  const [memberSearch, setMemberSearch] = useState('')
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const pollingRef = useRef(null)
  const stompClientRef = useRef(null)

  const numericSubjectId = useMemo(() => parseInt(subjectId, 10), [subjectId])
  const userRole = getUserRole()

  // Dynamic colors and initials for avatars
  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  const getAvatarColorClass = (name) => {
    if (!name) return 'bg-slate-400 text-white'
    const colors = [
      'bg-red-500 text-white', 'bg-orange-500 text-white', 'bg-amber-500 text-slate-900', 
      'bg-emerald-500 text-white', 'bg-teal-500 text-white', 'bg-blue-500 text-white', 
      'bg-indigo-500 text-white', 'bg-violet-500 text-white', 'bg-purple-500 text-white', 
      'bg-pink-500 text-white', 'bg-rose-500 text-white'
    ]
    let sum = 0
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i)
    }
    return colors[sum % colors.length]
  }

  // Load Subject details
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        if (mode === 'teacher') {
          const response = await subjectService.getTeacherSubjects()
          const found = response.data?.find((s) => s.id === numericSubjectId)
          setSubject(found || null)
        } else {
          const response = await subjectService.getEnrolledSubjects()
          const found = response.data?.find((s) => s.id === numericSubjectId)
          setSubject(found || null)
        }
      } catch (error) {
        console.error('Error fetching subject for chat:', error)
      } finally {
        setLoadingSubject(false)
      }
    }

    fetchSubject()
  }, [mode, numericSubjectId])

  // Load initial messages and participants list
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingMessages(true)
        setLoadingParticipants(true)

        await Promise.all([
          chatService.pingPresence(numericSubjectId).catch(() => {}),
          (async () => {
            const res = await chatService.getMessages(numericSubjectId)
            setMessages(res.data || [])
          })(),
          (async () => {
            const res = await chatService.getParticipants(numericSubjectId)
            setParticipants(res.data || null)
          })(),
        ])
      } catch (error) {
        console.error('Error loading chat:', error)
      } finally {
        setLoadingMessages(false)
        setLoadingParticipants(false)
      }
    }

    fetchInitialData()
  }, [numericSubjectId])

  // Group sequential messages from same sender within 2 minutes
  const groupedMessages = useMemo(() => {
    if (!messages) return []
    const groups = []
    messages.forEach((msg, idx) => {
      const prevMsg = messages[idx - 1]
      const isSameSender = prevMsg && prevMsg.senderId === msg.senderId
      const isTimeClose = prevMsg && (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 120000 // 2 minutes
      
      if (isSameSender && isTimeClose) {
        groups[groups.length - 1].contents.push({
          ...msg
        })
      } else {
        groups.push({
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          own: msg.own,
          contents: [{
            ...msg
          }]
        })
      }
    })
    return groups
  }, [messages])

  // Handle auto-scroll to bottom of chat
  useEffect(() => {
    const container = chatContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  // Periodic polling fallback for presence & online counts
  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) return

      pollingRef.current = setInterval(async () => {
        try {
          await chatService.pingPresence(numericSubjectId).catch(() => {})
          const participantsRes = await chatService.getParticipants(numericSubjectId)
          setParticipants(participantsRes.data || null)
        } catch (error) {
          console.error('Error polling presence:', error)
        }
      }, POLL_INTERVAL_MS)
    }

    startPolling()

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [numericSubjectId])

  // WebSocket (STOMP) connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8075'
    const wsUrl = `${baseUrl}/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      setWsStatus('connected')
      
      // Subscribe to chat messages
      client.subscribe(`/topic/chat.${numericSubjectId}`, (message) => {
        try {
          const body = JSON.parse(message.body)
          if (!body || !body.id) return

          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === body.id)
            const isOwn = body.senderId === user?.id || (user?.email && body.senderName === user.name)
            const mappedMsg = { ...body, own: isOwn }
            if (idx >= 0) {
              const updated = [...prev]
              updated[idx] = mappedMsg
              return updated
            } else {
              return [...prev, mappedMsg]
            }
          })
        } catch (e) {
          console.error('Error parsing chat message:', e)
        }
      })

      // Subscribe to presence updates
      client.subscribe(`/topic/presence.${numericSubjectId}`, (message) => {
        try {
          const presence = JSON.parse(message.body)
          if (!presence || !presence.userId) return

          setParticipants((prev) => {
            if (!prev) return prev

            const existing = prev.participants || []
            const updatedList = [...existing]

            const idx = updatedList.findIndex((p) => p.userId === presence.userId)
            if (idx >= 0) {
              updatedList[idx] = {
                ...updatedList[idx],
                online: presence.online,
              }
            } else {
              updatedList.push({
                userId: presence.userId,
                name: presence.userName,
                role: presence.role,
                online: presence.online,
              })
            }

            const onlineStudents = updatedList.filter(
              (p) => p.role === 'STUDENT' && p.online
            ).length

            return {
              ...prev,
              participants: updatedList,
              onlineStudents,
            }
          })
        } catch (e) {
          console.error('Error parsing presence update:', e)
        }
      })

      // Send initial presence update
      client.publish({
        destination: '/app/presence.update',
        body: JSON.stringify({ subjectId: numericSubjectId }),
      })
    }

    client.onDisconnect = () => {
      setWsStatus('offline')
    }

    client.onWebSocketClose = () => {
      setWsStatus('offline')
    }

    client.activate()
    stompClientRef.current = client

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
    }
  }, [numericSubjectId, user])

  const handleToggleUpvote = async (messageId) => {
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const newUpvoted = !m.upvoted;
            const newVoteCount = newUpvoted ? (m.voteCount || 0) + 1 : Math.max(0, (m.voteCount || 0) - 1);
            return { ...m, upvoted: newUpvoted, voteCount: newVoteCount };
          }
          return m;
        })
      )
      
      const res = await chatService.toggleUpvote(messageId)
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...res.data } : m))
        )
      }
    } catch (error) {
      console.error('Error toggling upvote:', error)
    }
  }

  const handleToggleDoubt = async (messageId) => {
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isDoubt: !m.isDoubt } : m))
      )
      const res = await chatService.toggleDoubt(messageId)
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...res.data } : m))
        )
      }
    } catch (error) {
      console.error('Error toggling doubt:', error)
    }
  }

  const handleToggleResolve = async (messageId) => {
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, resolved: !m.resolved } : m))
      )
      const res = await chatService.toggleResolve(messageId)
      if (res?.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...res.data } : m))
        )
      }
    } catch (error) {
      console.error('Error toggling resolve:', error)
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending) return

    try {
      setSending(true)
      const client = stompClientRef.current
      
      if (client && client.connected) {
        client.publish({
          destination: '/app/chat.send',
          body: JSON.stringify({
            subjectId: numericSubjectId,
            content: trimmed,
            isDoubt: isDoubt,
          }),
        })
        setInput('')
        setIsDoubt(false)
      } else {
        // Fallback to REST API
        const res = await chatService.sendMessage(numericSubjectId, trimmed, isDoubt)
        const message = res.data
        if (message) {
          setMessages((prev) => [...prev, { ...message, own: true }])
          setInput('')
          setIsDoubt(false)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const title = subject
    ? `${subject.name} Channel`
    : mode === 'teacher'
      ? 'Subject Chat'
      : 'Class Chat'

  const backHref =
    mode === 'teacher' ? `/teacher/subjects/${subjectId}` : `/student/enrolled`

  const totalStudents = participants?.totalStudents ?? 0
  const onlineStudents = participants?.onlineStudents ?? 0

  const sortedParticipants = useMemo(() => {
    if (!participants?.participants) return []
    return [...participants.participants].sort((a, b) => {
      if (a.role === b.role) return a.name.localeCompare(b.name)
      if (a.role === 'TEACHER') return -1
      if (b.role === 'TEACHER') return 1
      return a.name.localeCompare(b.name)
    })
  }, [participants])

  // Filtered members by search
  const filteredParticipants = useMemo(() => {
    if (!memberSearch.trim()) return sortedParticipants
    return sortedParticipants.filter(p => p.name?.toLowerCase().includes(memberSearch.toLowerCase()))
  }, [sortedParticipants, memberSearch])

  const showLayout = userRole === 'TEACHER' || userRole === 'STUDENT'

  const chatContent = (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto selection:bg-primary/20">
      {/* Title & Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-premium">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-xl h-9.5 w-9.5 border-border/60 hover:bg-accent/80 flex-shrink-0"
            onClick={() => navigate(backHref)}
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold font-outfit text-foreground">{title}</h1>
              {/* WS Status Pill */}
              <div className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider",
                wsStatus === 'connected' 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : wsStatus === 'connecting'
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20"
              )}>
                {wsStatus === 'connected' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{wsStatus}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-medium">Ask questions, share code, and collaborate in real-time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="rounded-lg text-xs h-9" onClick={() => navigate(backHref)}>
            Exit Workspace
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 min-h-[68vh] h-[68vh]">
        {/* Chat box area */}
        <Card className="lg:col-span-3 flex flex-col min-h-0 border border-border/40 bg-card/60 backdrop-blur-xl shadow-premium rounded-2xl overflow-hidden">
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            {/* Messages Scroll Area */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-6"
            >
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-3">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/60 animate-bounce-soft" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Welcome to the subject channel!</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">This is the start of the discussion history. Type a message below to say hello.</p>
                  </div>
                </div>
              ) : (
                groupedMessages.map((group, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      group.own ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* Avatar Column */}
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-premium uppercase",
                        group.own ? "bg-primary text-white" : getAvatarColorClass(group.senderName)
                      )}>
                        {getInitials(group.senderName)}
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Name and Role */}
                      <div className={cn(
                        "flex items-center gap-2",
                        group.own ? "justify-end" : "justify-start"
                      )}>
                        <span className="text-xs font-bold text-foreground tracking-tight">{group.own ? 'You' : group.senderName}</span>
                        {group.senderRole === 'TEACHER' && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider text-primary">
                            Teacher
                          </span>
                        )}
                      </div>

                      {/* Contents bubble list */}
                      <div className={cn("space-y-2 flex flex-col w-full", group.own ? "items-end ml-auto" : "items-start mr-auto")}>
                        {group.contents.map((c) => {
                          const isMsgDoubt = c.isDoubt;
                          const isMsgResolved = c.resolved;

                          const bubbleClass = cn(
                            "group/msg relative rounded-2xl px-3.5 py-2 text-sm shadow-premium leading-relaxed border transition-all duration-200 w-fit",
                            group.own ? "rounded-tr-none ml-auto" : "rounded-tl-none mr-auto",
                            !isMsgDoubt
                              ? (group.own 
                                  ? "bg-primary text-primary-foreground border-primary/20 hover:bg-primary/95" 
                                  : "bg-card text-foreground border-border/40 hover:bg-muted/10")
                              : (isMsgResolved
                                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-250 border-emerald-500/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40"
                                  : "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-250 border-amber-500/30 hover:bg-amber-100/50 dark:hover:bg-amber-950/40")
                          );

                          return (
                            <div key={c.id} className={cn("flex flex-col max-w-[85%]", group.own ? "items-end ml-auto" : "items-start mr-auto")}>
                              <div className={bubbleClass}>
                                {isMsgDoubt && (
                                  <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-extrabold uppercase tracking-wider select-none">
                                    {isMsgResolved ? (
                                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        ✓ Resolved Doubt
                                      </span>
                                    ) : (
                                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                                        ❓ Open Doubt
                                      </span>
                                    )}
                                  </div>
                                )}

                                <p className="whitespace-pre-wrap break-words text-[13px]">{c.content}</p>
                                
                                {/* Hover timestamp */}
                                {c.createdAt && (
                                  <span className={cn(
                                    "absolute bottom-1 right-2 text-[9px] opacity-0 group-hover/msg:opacity-75 transition-opacity font-medium",
                                    group.own && !isMsgDoubt ? "text-primary-foreground/80" : "text-muted-foreground"
                                  )}>
                                    {new Date(c.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>

                              {/* Message stats / controls underneath bubble */}
                              {(isMsgDoubt || userRole === 'TEACHER') && (
                                <div className={cn(
                                  "flex items-center gap-2 mt-1 px-1 text-[10px]",
                                  group.own ? "justify-end ml-auto" : "justify-start mr-auto"
                                )}>
                                  {/* Upvote Button */}
                                  {isMsgDoubt && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUpvote(c.id)}
                                      className={cn(
                                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all active:scale-95 font-bold shadow-sm text-[10px]",
                                        c.upvoted
                                          ? "bg-primary/20 text-primary border-primary/45"
                                          : "bg-background/80 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                                      )}
                                    >
                                      <span>👍</span>
                                      <span>{c.voteCount || 0}</span>
                                    </button>
                                  )}

                                  {/* Teacher Controls */}
                                  {userRole === 'TEACHER' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleDoubt(c.id)}
                                        className={cn(
                                          "px-2 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wide uppercase transition-all active:scale-95 shadow-sm",
                                          isMsgDoubt
                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                            : "bg-background/80 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                                        )}
                                      >
                                        {isMsgDoubt ? "Remove Doubt" : "Mark Doubt"}
                                      </button>
                                      
                                      {isMsgDoubt && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleResolve(c.id)}
                                          className={cn(
                                            "px-2 py-0.5 rounded-full border text-[9px] font-extrabold tracking-wide uppercase transition-all active:scale-95 shadow-sm",
                                            isMsgResolved
                                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                              : "bg-background/80 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                                          )}
                                        >
                                          {isMsgResolved ? "Unresolve" : "Resolve"}
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer Form */}
            <div className="p-4 border-t border-border/40 bg-card/90">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDoubt(!isDoubt)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 h-10 rounded-xl border text-xs font-bold transition-all active:scale-95 flex-shrink-0 shadow-sm",
                    isDoubt
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/35"
                      : "bg-background/80 text-muted-foreground border-border/60 hover:bg-muted"
                  )}
                >
                  <span>❓</span>
                  <span className="hidden sm:inline">Ask Doubt</span>
                </button>
                <Input
                  placeholder="Ask a question or type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="rounded-xl border-border bg-background/50 focus:bg-background transition-all"
                  disabled={sending}
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  disabled={sending || !input.trim()}
                  className="rounded-xl px-4.5 h-10 shadow-premium hover-glow active-pulse flex-shrink-0"
                >
                  {sending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Members Panel */}
        <Card className="hidden lg:flex flex-col min-h-0 border border-border/40 bg-card/60 backdrop-blur-xl shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold font-outfit text-foreground">Workspace Members</CardTitle>
              </div>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {onlineStudents} online
              </span>
            </div>
            {subject && (
              <p className="mt-1 text-[11px] text-muted-foreground font-medium truncate">
                Class: <span className="font-bold">{subject.name}</span>
              </p>
            )}
            
            {/* Search members input */}
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="h-8 pl-8 text-xs rounded-lg border-border/60 bg-background/50"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 overflow-y-auto">
            {loadingParticipants ? (
              <div className="flex h-full items-center justify-center p-6">
                <LoadingSpinner size="sm" />
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center p-6 text-xs text-muted-foreground font-medium">
                No members found.
              </div>
            ) : (
              <div className="space-y-1.5 p-3">
                {filteredParticipants.map((p) => (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between rounded-xl border border-border/30 bg-card/85 px-3 py-2 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Avatar */}
                      <div className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase flex-shrink-0 shadow-sm",
                        getAvatarColorClass(p.name)
                      )}>
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                          <span>{p.name || 'Unknown'}</span>
                          {p.role === 'TEACHER' && (
                            <span className="rounded bg-primary/10 px-1 py-[0.5px] text-[8px] font-bold uppercase text-primary">
                              Pro
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground capitalize">{p.role?.toLowerCase()}</span>
                      </div>
                    </div>
                    
                    {/* Online status indicator */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        p.online ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-muted-foreground/40"
                      )}></div>
                      <span className="text-[9px] font-semibold text-muted-foreground capitalize">
                        {p.online ? 'active' : 'idle'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (!showLayout) {
    return chatContent
  }

  return <DashboardLayout>{chatContent}</DashboardLayout>
}
