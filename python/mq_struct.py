# -*- coding: UTF-8 -*-   
import pika
import sys
import logging
import json

logging.basicConfig()
messages = 0

class MqStruct:
    
    def __init__(self, queue_id, role):
        self.role = 'req'
        if role == 'res':
            self.role = 'res'
            
        self.queue_id = queue_id
        
    def connect(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
        channel = connection.channel()
        channel.queue_declare(queue=self.queue_id)
        self.channel = channel
        self.connection = connection
        
    def disconnect(self):
        self.connection.close()
        pass
        
    #send message
    def setMessage(self, message):
        if self.role == 'res':
            raise "set message: role error"
        
        data = json.dumps(message, ensure_ascii=False)
        self.channel.basic_publish(exchange='',
                      routing_key=self.queue_id,
                      body=data)
        pass
    
    #listern messages
    def startListenMessage(self, callback):
        if self.role == 'req':
            raise "set message: role error"
        
        def _on_msg(*arg):
            channel, method, header, body = arg
            data = None
            if body != None:
                data = json.loads(body)
            callback(self,data)
        
        self.channel.basic_consume(_on_msg, no_ack=True)
        self.channel.start_consuming()
        
    #listern messages
    def stopListenMessage(self):
        self.channel.stop_consuming()
        
    #get message simple
    def getMessage(self, **arg):
        if self.role == 'req':
            raise "set message: role error"
        
        out = self.channel.basic_get(queue=self.queue_id, no_ack=True)
        data = None
        if out[2] != None:
            data = json.loads(out[2])
        return data
                
def on_message(*arg):
    agent, body = arg
    print "Message:",
    print "%r" % body
    if body == 'exit':
        agent.stopListenMessage()
    
def test():
    args = sys.argv[1:]
    print args
    
    if args[0] == 'req':
        mq_agent = MqStruct('queue', 'req')
        mq_agent.connect()
        while 1:
            msg = raw_input()
            mq_agent.setMessage(msg)
            if msg == 'exit':
                break
        mq_agent.disconnect()
    
    if args[0] == 'res':
        mq_agent = MqStruct('queue', 'res')
                
        mq_agent.connect()
        msg = mq_agent.getMessage(callback=on_message, async=1)
        print msg
        mq_agent.disconnect()
        
    if args[0] == 'res2':
        mq_agent = MqStruct('queue', 'res')
                
        mq_agent.connect()
        mq_agent.startListenMessage(on_message)
    
    
if __name__ == '__main__':
    try:
        test()
    except KeyboardInterrupt:
        pass