//package org.example.webrtc;
//
//import jakarta.websocket.server.ServerEndpointConfig;
//import org.springframework.beans.BeansException;
//import org.springframework.beans.factory.BeanFactory;
//import org.springframework.context.ApplicationContext;
//import org.springframework.context.ApplicationContextAware;
//
//public class MyEndpointConfigure extends ServerEndpointConfig.Configurator implements ApplicationContextAware {
//    private static volatile BeanFactory context;
//
//    @Override
//    public <T> T getEndpointInstance(Class<T> clazz) throws InstantiationException {
//        return context.getBean(clazz);
//    }
//
//    @Override
//    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
//        MyEndpointConfigure.context = applicationContext;
//    }
//}
