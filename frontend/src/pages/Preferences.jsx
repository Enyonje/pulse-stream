import { useEffect, useState } from 'react';
import { getPrefs } from '../api';

export default function Preferences() {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    getPrefs('123').then((res) => setPrefs(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">User Preferences</h2>
      {prefs ? (
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(prefs, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}