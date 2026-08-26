import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { Loader2 } from 'lucide-react';
import '@livekit/components-styles';
import { useLivekitToken } from '../../lib/queries/chat-queries';

export default function SaathiCallPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get('conversationId');
  const callType = searchParams.get('type') as 'audio' | 'video' || 'video';

  const [token, setToken] = useState('');
  const [wsUrl, setWsUrl] = useState('');

  const generateToken = useLivekitToken();

  useEffect(() => {
    if (!conversationId) {
      navigate(-1);
      return;
    }

    generateToken.mutate({ conversationId, callType }, {
      onSuccess: (res) => {
        setToken(res.data.token);
        setWsUrl(res.data.wsUrl);
      },
      onError: () => {
        navigate(-1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, callType, navigate]);

  if (!token || !wsUrl) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh' }}>
      <LiveKitRoom
        token={token}
        serverUrl={wsUrl}
        connect={true}
        video={callType === 'video'}
        audio={true}
        onDisconnected={() => navigate(-1)}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
