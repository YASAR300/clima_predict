import { NextResponse } from 'next/server';

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body?.message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    const { message, title, target = 'both', metadata = {} } = body;
    const results = [];

    if ((target === 'slack' || target === 'both') && SLACK_WEBHOOK_URL) {
      const payload = {
        text: title ? `*${title}*\n${message}` : message,
        blocks: buildSlackBlocks({ title, message, metadata }),
      };
      results.push(await dispatchWebhook(SLACK_WEBHOOK_URL, payload, 'Slack'));
    }

    if ((target === 'discord' || target === 'both') && DISCORD_WEBHOOK_URL) {
      const payload = {
        content: title ? `**${title}**\n${message}` : message,
        embeds:
          title || Object.keys(metadata).length
            ? [
                {
                  title: title || 'Weather Alert',
                  description: message,
                  color: 5814783,
                  fields: Object.entries(metadata).map(([name, value]) => ({
                    name,
                    value: String(value),
                    inline: false,
                  })),
                  timestamp: new Date().toISOString(),
                },
              ]
            : undefined,
      };
      results.push(
        await dispatchWebhook(DISCORD_WEBHOOK_URL, payload, 'Discord')
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        {
          error:
            'No webhook targets configured. Set SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL.',
        },
        { status: 500 }
      );
    }

    const failures = results.filter((result) => result.status !== 'ok');
    const status = failures.length === results.length ? 500 : 200;

    return NextResponse.json(
      {
        delivered: results.filter((result) => result.status === 'ok'),
        failed: failures,
      },
      { status }
    );
  } catch (error) {
    console.error('[webhooks.integration] error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to dispatch webhook notification.' },
      { status: 500 }
    );
  }
}

async function dispatchWebhook(url, payload, label) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        target: label,
        status: 'error',
        message: `Webhook request failed (${response.status}): ${body}`,
      };
    }

    return { target: label, status: 'ok' };
  } catch (error) {
    return { target: label, status: 'error', message: error.message };
  }
}

function buildSlackBlocks({ title, message, metadata }) {
  const blocks = [];

  if (title) {
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: title,
      },
    });
  }

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: message,
    },
  });

  const metadataEntries = Object.entries(metadata);
  if (metadataEntries.length) {
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      fields: metadataEntries.map(([key, value]) => ({
        type: 'mrkdwn',
        text: `*${key}:*\n${value}`,
      })),
    });
  }

  return blocks;
}


