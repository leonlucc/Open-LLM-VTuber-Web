/* eslint-disable no-nested-ternary */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/require-default-props */
import { Box } from '@chakra-ui/react';
import {
  memo, useEffect, useRef, useCallback,
} from 'react';
import { ChatBubble } from './chat-bubble';
import { sidebarStyles, chatPanelStyles } from './sidebar-styles';
import { Message } from '@/services/websocket-service';
import { MainContainer, ChatContainer, MessageList as ChatMessageList, Message as ChatMessage, Avatar as ChatAvatar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useChatHistory } from '@/context/chat-history-context';
import { Global } from '@emotion/react';
import { useConfig } from '@/context/character-config-context';
import { useWebSocket } from '@/context/websocket-context';
import ReactECharts from 'echarts-for-react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/table';

// Type definitions
interface MessageListProps {
  messages: Message[]
  messageListRef: React.RefObject<HTMLDivElement>
  onMessageUpdate?: (message: Message) => void
}

// Memoized message list component with scroll handling
const MessageList = memo(({ messages, messageListRef }: MessageListProps): JSX.Element => {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      const { scrollHeight } = messageListRef.current;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;

      messageListRef.current.scrollTo({
        top: maxScrollTop + 100,
        behavior: 'smooth',
      });
    }
  }, [messageListRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <Box {...sidebarStyles.chatHistoryPanel.messageList} ref={messageListRef}>
      {messages.map((message, index) => (
        <Box
          key={`${message.role}-${message.timestamp}-${message.id}`}
          ref={index === messages.length - 1 ? lastMessageRef : null}
        >
          <ChatBubble
            message={message}
          />
        </Box>
      ))}
    </Box>
  );
});

MessageList.displayName = 'MessageList';

// Main component
function ChatHistoryPanel(): JSX.Element {
  const { messages } = useChatHistory();
  const { confName } = useConfig();
  const { baseUrl } = useWebSocket();
  const userName = "Me";

  const validMessages = messages.filter((msg) => msg.content && msg.content.trim().length > 0);
  const options = {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
  };
  const option2 = {
	'series': [{
		'data': [172687.53, 56371.37, 55127.17, 20982.11, 6572.48, 4482.37, 4245.26, 2016.55, 1119.64, 950.98, 401.71, 250.17, 171.39, 30.06],
		'itemStyle': {
			'color': '#3398DB'
		},
		'name': 'total_sales_amount',
		'type': 'bar'
	}],
	'title': {
    'text': 'product_name与total_sales_amount关系图'
    },
	'type': 'bar',
	'xAxis': {
		'data': ['MacBook Pro', 'iPhone 15', 'Apple Watch', '小 米手机', '戴尔笔记本', 'Nike运动鞋', 'SK-II面膜', 'Adidas外套', '伊利牛奶', '欧莱雅洗发水', '雀巢咖啡', '三只松鼠坚果', '大宝护肤霜', '可口可乐'],
		'name': 'product_name',
		'type': 'category'
	},
	'yAxis': {
		'name': 'total_sales_amount',
		'type': 'value'
	}
}
  return (
    <Box
      h="full"
      overflow="hidden"
      bg="gray.900"
    >
      <Global styles={chatPanelStyles} />
      <MainContainer>
        <ChatContainer>
          <ChatMessageList>
            {validMessages.length === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="whiteAlpha.500"
                fontSize="sm"
              >
                No messages yet. Start a conversation!
              </Box>             
            ) : (
              validMessages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    model={{
                      message: msg.content,
                      sentTime: msg.timestamp,
                      sender: msg.role === 'ai'
                        ? (msg.name || confName || 'AI')
                        : userName,
                      direction: msg.role === 'ai' ? 'incoming' : 'outgoing',
                      position: 'single',
                      type: "custom",
                    }}
                    avatarPosition={msg.role === 'ai' ? 'tl' : 'tr'}
                    avatarSpacer={false}
                  >
                    <ChatMessage.CustomContent>
                    {
                      msg.role === 'human' ? (
                        msg.content
                      ) : msg.visual_type === 'chart' ? (
                        <ReactECharts option={msg.visual_data} notMerge={true} lazyUpdate={true} style={{ height: 400,width: 600 }} />
                      ) : msg.visual_type === 'table' ? (
                        typeof msg.visual_data === 'string'
                          ? msg.visual_data
                          : <VisualTable data={msg.visual_data} />
                      ) : (
                        msg.content
                      )
                    }
                  </ChatMessage.CustomContent>
                    <ChatAvatar>
                      {msg.role === 'ai' ? (
                        msg.avatar ? (
                          <img
                            src={`${baseUrl}/avatars/${msg.avatar}`}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                          />
                        ) : (
                          (msg.name && msg.name[0].toUpperCase()) ||
                          (confName && confName[0].toUpperCase()) ||
                          'A'
                        )
                      ) : (
                        userName[0].toUpperCase()
                      )}
                    </ChatAvatar>
                  </ChatMessage>
              ))
            )}
          </ChatMessageList>
        </ChatContainer>
      </MainContainer>
    </Box>
  );
}

// 表格渲染组件
function VisualTable({ data }: { data: any }) {
  if (!Array.isArray(data) || data.length === 0) return <div>无数据</div>;
  const isObjectArray = typeof data[0] === 'object' && !Array.isArray(data[0]);
  const headers = isObjectArray ? Object.keys(data[0]) : data[0].map((_: any, i: number) => `列${i + 1}`);
  return (
    <Table
      size="sm"
      variant="simple"
      mt={2}
      mb={2}
      sx={{
        'th, td': {
          borderColor: 'white',
          color: 'white',
        },
        'thead tr': {
          borderColor: 'white',
          background: '#333',
        },
        'tbody tr': {
          borderColor: 'white',
          background: '#222',
        },
      }}
    >
      <Thead>
        <Tr>
          {headers.map((h) => (
            <Th key={h}>{h}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row: any, idx: number) => (
          <Tr key={idx}>
            {isObjectArray
              ? headers.map((h) => <Td key={h}>{row[h]}</Td>)
              : row.map((cell: any, i: number) => <Td key={i}>{cell}</Td>)}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
export default ChatHistoryPanel;
