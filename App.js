import { useState, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const WELCOME_MESSAGE = { id: '0', text: 'Hi! Type something below and press Send.', fromMe: false };

// base padding for Small; Medium adds 10, Large adds 20
const HEADER_PADDING = { small: 8, medium: 18, large: 28 };

function makeSession(index) {
  return {
    id: Date.now().toString() + index,
    name: `Session ${index}`,
    messages: [{ ...WELCOME_MESSAGE, id: `welcome-${index}` }],
  };
}

export default function App() {
  const [sessions, setSessions] = useState([makeSession(1)]);
  const [currentSessionId, setCurrentSessionId] = useState(sessions[0].id);
  const [inputText, setInputText] = useState('');
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [sessionsMenuVisible, setSessionsMenuVisible] = useState(false);
  const [headerSize, setHeaderSize] = useState('small');
  const [headerHeight, setHeaderHeight] = useState(0);
  const listRef = useRef(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // ── send a message into the current session ──────────────────────────────
  function sendMessage() {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now().toString(), text: trimmed, fromMe: true };
    const echo = {
      id: (Date.now() + 1).toString(),
      text: `You said: "${trimmed}"`,
      fromMe: false,
    };

    setSessions(prev =>
      prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, userMessage, echo] }
          : s
      )
    );
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  // ── create a brand-new session and switch to it ───────────────────────────
  function createNewSession() {
    const next = makeSession(sessions.length + 1);
    setSessions(prev => [...prev, next]);
    setCurrentSessionId(next.id);
    setInputText('');
  }

  // ── switch to an existing session ─────────────────────────────────────────
  function switchSession(id) {
    setCurrentSessionId(id);
    setSessionsMenuVisible(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── header ────────────────────────────────────────────────────────── */}
      <View
        testID="header"
        style={[styles.header, { paddingVertical: HEADER_PADDING[headerSize] }]}
        onLayout={e => {
          const h = e.nativeEvent.layout.height;
          setHeaderHeight(h);
          console.log(`[header] size=${headerSize} measuredHeight=${h} keyboardVerticalOffset=0`);
        }}
      >
        {/* session picker */}
        <TouchableOpacity
          testID="session-selector"
          style={styles.sessionSelector}
          onPress={() => setSessionsMenuVisible(true)}
        >
          <Text style={styles.headerTitle}>{currentSession.name}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        {/* S / M / L size buttons */}
        <View style={styles.sizeButtons}>
          {['small', 'medium', 'large'].map(size => (
            <TouchableOpacity
              key={size}
              testID={`size-${size}`}
              style={[styles.sizeButton, headerSize === size && styles.sizeButtonActive]}
              onPress={() => setHeaderSize(size)}
            >
              <Text style={[styles.sizeButtonText, headerSize === size && styles.sizeButtonTextActive]}>
                {size[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* new session button */}
        <TouchableOpacity testID="new-session-button" style={styles.newButton} onPress={createNewSession}>
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={currentSession.messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => <MessageBubble message={item} />}
        />

        {/* ── attach (+) menu ───────────────────────────────────────────────── */}
        <Modal
          visible={attachMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAttachMenuVisible(false)}
        >
          <Pressable style={styles.menuBackdrop} onPress={() => setAttachMenuVisible(false)}>
            <View style={styles.menuBox}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setAttachMenuVisible(false); alert('Add a file tapped'); }}
              >
                <Text style={styles.menuItemIcon}>📎</Text>
                <Text style={styles.menuItemText}>Add a file</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { setAttachMenuVisible(false); alert('Shortcuts tapped'); }}
              >
                <Text style={styles.menuItemIcon}>⚡</Text>
                <Text style={styles.menuItemText}>Shortcuts</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* ── input box ─────────────────────────────────────────────────────── */}
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              testID="chat-input"
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
                  nativeEvent.preventDefault?.();
                  sendMessage();
                }
              }}
            />
            <View style={styles.inputToolbar}>
              <TouchableOpacity testID="plus-button" style={styles.plusButton} onPress={() => setAttachMenuVisible(true)}>
                <Text style={styles.plusButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="send-button"
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── sessions dropdown (outside KeyboardAvoidingView so it overlays everything) */}
      <Modal
        visible={sessionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSessionsMenuVisible(false)}
      >
        <Pressable style={styles.sessionsBackdrop} onPress={() => setSessionsMenuVisible(false)}>
          {/* stop tap-through on the box itself */}
          <Pressable>
            <View style={styles.sessionsBox}>
              <Text style={styles.sessionsHeading}>Sessions</Text>
              <ScrollView bounces={false}>
                {sessions.map((session, index) => (
                  <View key={session.id}>
                    {index > 0 && <View style={styles.menuDivider} />}
                    <TouchableOpacity
                      style={styles.sessionItem}
                      onPress={() => switchSession(session.id)}
                    >
                      <Text
                        style={[
                          styles.sessionItemText,
                          session.id === currentSessionId && styles.sessionItemActive,
                        ]}
                      >
                        {session.name}
                      </Text>
                      {session.id === currentSessionId && (
                        <Text style={styles.sessionCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

function MessageBubble({ message }) {
  return (
    <View testID="message-bubble" style={[styles.bubbleWrapper, message.fromMe ? styles.bubbleRight : styles.bubbleLeft]}>
      <View style={[styles.bubble, message.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text selectable style={[styles.bubbleText, message.fromMe && styles.bubbleTextMe]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },

  // ── header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sessionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  dropdownArrow: { fontSize: 14, color: '#555', marginTop: 2 },

  newButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 14,
  },
  newButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  sizeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonActive: {
    backgroundColor: '#007AFF',
  },
  sizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },

  // ── messages ──────────────────────────────────────────────────────────────
  messageList: { padding: 16, gap: 8 },
  bubbleWrapper: { flexDirection: 'row', marginVertical: 2 },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 16, color: '#1a1a1a', lineHeight: 22 },
  bubbleTextMe: { color: '#fff' },

  // ── input ─────────────────────────────────────────────────────────────────
  inputRow: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  inputContainer: { backgroundColor: '#f0f0f0', borderRadius: 16 },
  input: {
    height: 66,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: { fontSize: 20, color: '#555', lineHeight: 20, includeFontPadding: false },
  sendButton: {
    height: 32,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#b0c9f5' },
  sendButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  // ── attach menu ───────────────────────────────────────────────────────────
  menuBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 80,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuItemIcon: { fontSize: 20 },
  menuItemText: { fontSize: 16, color: '#1a1a1a' },
  menuDivider: { height: 1, backgroundColor: '#e5e5e5', marginHorizontal: 16 },

  // ── sessions dropdown ─────────────────────────────────────────────────────
  sessionsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 64,          // clears the header
    paddingHorizontal: 16,
  },
  sessionsBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    maxHeight: 320,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sessionsHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sessionItemText: { fontSize: 16, color: '#1a1a1a' },
  sessionItemActive: { fontWeight: '600', color: '#007AFF' },
  sessionCheckmark: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
});
