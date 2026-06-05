package in.skillsync.session.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE           = "skillsync.events";
    public static final String NOTIFICATION_QUEUE = "skillsync.notification.queue";

    public static final String ROUTING_SESSION_BOOKED    = "session.booked";
    public static final String ROUTING_SESSION_ACCEPTED  = "session.accepted";
    public static final String ROUTING_SESSION_REJECTED  = "session.rejected";
    public static final String ROUTING_SESSION_COMPLETED = "session.completed";
    public static final String ROUTING_SESSION_CANCELLED = "session.cancelled";

    @Bean
    public TopicExchange skillSyncExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue,
                                       TopicExchange skillSyncExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(skillSyncExchange)
                .with("session.#");
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter());
        return template;
    }
}
