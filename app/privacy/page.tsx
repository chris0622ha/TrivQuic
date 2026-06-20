import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function PrivacyPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0f0f1a',fontFamily:"'JetBrains Mono',monospace",color:'#e5e7eb',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #2d2d44'}}>
        <Link href="/" style={{color:'#f59e0b',fontWeight:800,fontSize:18,textDecoration:'none'}}>TrivQuic</Link>
        <Link href="/" style={{color:'#6b7280',fontSize:13,textDecoration:'none'}}>← Back</Link>
      </nav>
      <main style={{maxWidth:740,margin:'120px auto',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:20}}>🔒</div>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:12}}>Privacy Policy</h1>
        <p style={{color:'#6b7280',fontSize:14,lineHeight:1.7}}>Coming soon. Check back later.</p>
        <Link href="/" style={{display:'inline-block',marginTop:32,padding:'10px 24px',background:'#f59e0b',borderRadius:8,color:'#0f0f1a',fontWeight:700,fontSize:13,textDecoration:'none'}}>Back to TrivQuic</Link>
      </main>
    </div>
  );
}
