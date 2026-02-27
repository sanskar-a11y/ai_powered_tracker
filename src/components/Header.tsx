import Link from 'next/link'

export default function Header() {
  return (
    <header style={{padding:16, borderBottom:'1px solid #eee'}}>
      <nav>
        <Link href="/">Home</Link> | <Link href="/dashboard">Dashboard</Link>
      </nav>
    </header>
  )
}
