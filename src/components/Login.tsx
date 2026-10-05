interface Props {
  error: string
  onSignIn: () => void
  onLocal: () => void
}

export default function Login({ error, onSignIn, onLocal }: Props) {
  return (
    <main className="login">
      <div className="login-inner">
        <p className="eyebrow">腦圖書館</p>
        <h1 className="big">
          你的私人
          <br />
          學習空間<span className="dot">.</span>
        </h1>
        <p className="lead">登入後，手機和電腦的科目、筆記與單字卡會自動同步，只有你看得到。</p>
        <div className="glass login-card">
          <button className="btn primary wide" onClick={onSignIn}>
            使用 Google 登入
          </button>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button className="link-btn" onClick={onLocal}>
            先不登入，只存在這台裝置
          </button>
        </div>
      </div>
    </main>
  )
}
