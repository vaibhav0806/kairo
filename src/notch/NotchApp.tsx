import { useEffect } from 'react';

export function NotchApp() {
  useEffect(() => {
    document.documentElement.classList.add('notch-document');
    document.body.classList.add('notch-document');

    return () => {
      document.documentElement.classList.remove('notch-document');
      document.body.classList.remove('notch-document');
    };
  }, []);

  return (
    <main className="notch-shell" aria-label="Kairo assistant status">
      <div className="notch-card">
        <div className="notch-orb" aria-hidden="true" />
        <div>
          <strong>Kairo is active</strong>
          <span>Listening for context</span>
        </div>
      </div>
    </main>
  );
}
