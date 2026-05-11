/** @jsxImportSource preact */
import {makeEditorPlugin, Tab, Pane} from '@motion-canvas/ui';
import {useState} from 'preact/hooks';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function ChatPane() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages;
    setMessages(m => [...m, {role: 'user', content: text}]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text, history}),
      });
      const data = await res.json();
      setMessages(m => [
        ...m,
        {role: 'assistant', content: data.reply ?? data.error},
      ]);
    } catch (e: any) {
      setMessages(m => [
        ...m,
        {role: 'assistant', content: `Ошибка: ${e.message}`},
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <Pane title="AI Chat" id="ai-chat-pane">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: '8px',
          padding: '8px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{color: '#666', fontSize: '13px', padding: '8px', textAlign: 'center'}}
            >
              Опиши что добавить или изменить в анимации
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: m.role === 'user' ? '#2a2a3a' : '#1a2a1a',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
              }}
            >
              <strong style={{color: m.role === 'user' ? '#9b8fd4' : '#7abf7a'}}>
                {m.role === 'user' ? 'Вы' : 'ИИ'}:
              </strong>{' '}
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{color: '#888', fontSize: '13px', padding: '6px'}}>
              Думает...
            </div>
          )}
        </div>
        <div style={{display: 'flex', gap: '6px', flexShrink: 0}}>
          <textarea
            value={input}
            rows={3}
            placeholder="Опишите изменения… (Enter — отправить, Shift+Enter — новая строка)"
            onInput={(e) => setInput((e.target as HTMLTextAreaElement).value)}
            onKeyDown={onKeyDown as any}
            style={{
              flex: 1,
              resize: 'none',
              padding: '6px',
              fontSize: '13px',
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{
              padding: '0 14px',
              background: loading ? '#555' : '#7c5cbf',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            →
          </button>
        </div>
      </div>
    </Pane>
  );
}

function ChatTab({tab}: {tab: string}) {
  return (
    <Tab title="AI Chat" id="ai-chat-tab" tab={tab}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    </Tab>
  );
}

export default makeEditorPlugin({
  name: 'historeel-ai-chat',
  tabs: [
    {
      name: 'ai-chat',
      tabComponent: ChatTab,
      paneComponent: ChatPane,
    },
  ],
});
