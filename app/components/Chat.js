import React, { useContext, useEffect, useRef } from 'react';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import { Link } from 'react-router-dom';
import { useImmer } from 'use-immer';
import io from 'socket.io-client';

function Chat() {
  // create references for direct access
  const socket = useRef(null);
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  // console.log(appState.chatIsOpen);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessages: [],
  });

  useEffect(() => {
    // select input and set as focus when chat window is open
    if (appState.chatIsOpen) {
      chatField.current.focus();
      appDispatch({ type: 'clearUnreadChatCount' });
    }
  }, [appState.chatIsOpen]);

  useEffect(() => {
    // open socket connection when compnent renders
    socket.current = io('http://localhost:8080');
    socket.current.on('chatFromServer', message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });
    // close socket connection when component is unmounted
    return () => socket.current.disconnect();
  }, []);

  // automatically scroll to bottom (most recent) message
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.chatIsOpen) {
      appDispatch({ type: 'incrementUnreadChatCount' });
    }
  }, [state.chatMessages]);

  function handleFieldChange(e) {
    // create constant for field value in order to access from inside setState function
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // send message to chat server
    socket.current.emit('chatFromBrowser', {
      message: state.fieldValue,
      token: appState.user.token,
    });

    // add message to state collection of messages and clear value from input
    setState(draft => {
      draft.chatMessages.push({
        message: draft.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.fieldValue = '';
    });
  }

  return (
    <div
      id='chat-wrapper'
      className={`chat-wrapper shadow border-top border-left border-right
        ${appState.chatIsOpen ? 'chat-wrapper--is-visible' : ''}`}
    >
      <div className='chat-title-bar bg-primary'>
        Chat
        <span onClick={() => appDispatch({ type: 'closeChat' })} className='chat-title-bar-close'>
          <i className='fas fa-times-circle'></i>
        </span>
      </div>
      <div id='chat' className='chat-log' ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className='chat-self'>
                <div className='chat-message'>
                  <div className='chat-message-inner'>{message.message}</div>
                </div>
                <img className='chat-avatar avatar-tiny' src={message.avatar} />
              </div>
            );
          }

          return (
            <div key={index} className='chat-other'>
              <Link to={`/profile/${message.username}`}>
                <img className='avatar-tiny' src={message.avatar} />
              </Link>
              <div className='chat-message'>
                <div className='chat-message-inner'>
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id='chatForm' className='chat-form border-top'>
        <input
          value={state.fieldValue}
          onChange={handleFieldChange}
          ref={chatField}
          type='text'
          className='chat-field'
          id='chatField'
          placeholder='Type a message…'
          autoComplete='off'
        />
      </form>
    </div>
  );
}

export default Chat;
