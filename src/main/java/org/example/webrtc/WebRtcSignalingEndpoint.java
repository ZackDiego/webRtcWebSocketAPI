package org.example.webrtc;

import lombok.extern.apachecommons.CommonsLog;
import org.springframework.stereotype.Component;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@ServerEndpoint(value = "/signal", configurator = MyEndpointConfigure.class)
@CommonsLog
@Component
public class WebRtcSignalingEndpoint {

    private static final Set<Session> sessions = Collections.synchronizedSet(new HashSet<Session>());

    @OnOpen
    public void onOpen(Session session) throws IOException, EncodeException {
        System.out.println("Open!");
        sessions.add(session);
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Close!");
        sessions.remove(session);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error(error);
    }

    @OnMessage
    public void onMessage(String data, Session session) throws IOException {
        System.out.println("Got signal - " + data);

        for (Session sess : sessions) {
            if (!sess.equals(session)) {
                sess.getBasicRemote().sendText(data);
            }
        }
    }
}
