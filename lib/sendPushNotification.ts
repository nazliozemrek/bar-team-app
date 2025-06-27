import axios from 'axios';


export async function sendPushNotification(title: string, message: string) {
  try {
    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { en: title },
        contents: { en: message },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
