import { Construct } from 'constructs';
import {
  Subscription,
  SubscriptionFilter,
  SubscriptionProtocol,
  Topic,
} from 'aws-cdk-lib/aws-sns';

interface SnsConstructProps {
  SNS_BIG_STOCK_EMAIL: string;
  SNS_ADDITIONAL_EMAIL: string;
}

export class SnsConstruct extends Construct {
  readonly createProductTopic: Topic;

  constructor(scope: Construct, id: string, props: SnsConstructProps) {
    super(scope, id);

    const { SNS_BIG_STOCK_EMAIL, SNS_ADDITIONAL_EMAIL } = props;

    const createProductTopic = new Topic(this, 'CreateProductTopic', {
      topicName: 'create-product-topic',
    });

    new Subscription(this, 'BigStockSubscription', {
      endpoint: SNS_BIG_STOCK_EMAIL,
      protocol: SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
    });

    new Subscription(this, 'FilteredSubscription', {
      endpoint: SNS_ADDITIONAL_EMAIL,
      protocol: SubscriptionProtocol.EMAIL,
      topic: createProductTopic,
      filterPolicy: {
        title: SubscriptionFilter.stringFilter({
          allowlist: ['book', 'phone'],
        }),
      },
    });

    this.createProductTopic = createProductTopic;
  }
}
