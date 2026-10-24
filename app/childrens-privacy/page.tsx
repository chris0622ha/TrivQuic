import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default function ChildrensPrivacyPage() {
  return (
    <div style={{minHeight:'100vh',background:'#130a24',fontFamily:"'JetBrains Mono',monospace",color:'#f3eeff',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #3a2760'}}>
        <Link href="/" style={{color:'#ff4f8b',fontWeight:800,fontSize:18,textDecoration:'none'}}>TrivQuic</Link>
        <Link href="/" style={{color:'#a094c4',fontSize:13,textDecoration:'none'}}>← Back</Link>
      </nav>
      <main style={{maxWidth:740,margin:'120px auto',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:20}}>🧒</div>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:12}}>Children's Privacy</h1>
        <p style={{color:'#a094c4',fontSize:14,lineHeight:1.7}}>Coming soon. Check back later.</p>
        <Link href="/" style={{display:'inline-block',marginTop:32,padding:'10px 24px',background:'#ff4f8b',borderRadius:12,color:'#130a24',fontWeight:700,fontSize:13,textDecoration:'none'}}>Back to TrivQuic</Link>
      </main>
    </div>
  );
}
