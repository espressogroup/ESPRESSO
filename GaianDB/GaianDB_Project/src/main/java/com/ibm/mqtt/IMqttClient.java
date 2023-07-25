package com.ibm.mqtt;

/**
 * @author Reza Moosaei 27.02.23 15:56
 */
public class IMqttClient {
    public static void registerSimpleHandler(Object input) {

    }

    public static void connect(Object inputOne,Object inputTwo,Object inputThree) {

    }

    public static void publish(Object inputOne,Object inputTwo,Object inputThree,Object inputFour) throws MqttException {
        if( 1 == 0)
            throw new MqttException();
    }

    public void subscribe(Object inputOne,Object inputTwo) {

    }

    public static Boolean isConnected() {
        return true;
    }

    public static void unsubscribe(Object input) {

    }

    public static void terminate() {

    }

    public static void disconnect() throws MqttException {
        if(1 == 0) {
            throw new MqttException();
        }
    }


}
