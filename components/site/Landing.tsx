'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, FlaskConical, LineChart, Orbit, Sparkles } from 'lucide-react'
import { EXOPLANETA } from '@/lib/labs/catalog'
import { STEP_LABEL } from '@/lib/labs/types'
import { rise, stagger } from '@/lib/motion'
import { formatNumber } from '@/lib/format'
import Starfield from '@/components/aeso/Starfield'
import SkyThumb from '@/components/aeso/SkyThumb'
import TransitSimulator from '@/components/instruments/TransitSimulator'
import { LabCover } from '@/components/labs/LabCover'
import { Logo } from '@/components/observatory/ui'
import { VegaOrb } from '@/components/observatory/Nav'

const reveal = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
} as const

function Cta({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  return (
    <Link
      href={href}
      className={
        variant === 'primary'
          ? 'focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black transition hover:gap-3 hover:bg-white/90 active:scale-[0.97]'
          : 'focus-ring inline-flex h-12 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-6 text-[15px] font-medium text-white transition hover:bg-white/[0.1] active:scale-[0.97]'
      }
    >
      {children}
    </Link>
  )
}

export default function Landing() {
  const [flux, setFlux] = useState(1)
  return (
    <div className="relative">
      <Starfield />

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-3 flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/[0.06] bg-[#030407]/60 px-3 pl-4 backdrop-blur-2xl sm:mx-4 lg:mx-auto">
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-full">
            <Logo size={26} />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">AESo</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[14px] text-white/55 md:flex">
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
            <a href="#laboratorios" className="hover:text-white">Laboratórios</a>
            <a href="#ceu" className="hover:text-white">Céu</a>
            <a href="#professores" className="hover:text-white">Professores</a>
          </nav>
          <Link href="/app" className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13.5px] font-medium text-black transition active:scale-[0.97]">
            Abrir o Observatório
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-12 px-5 pb-16 pt-28 lg:grid-cols-[1.05fr_1fr]">
        <motion.div variants={stagger(0.08, 0.15)} initial="hidden" animate="show">
          <motion.p variants={rise} className="eyebrow">
            Física e astronomia, na prática
          </motion.p>
          <motion.h1
            variants={rise}
            className="mt-5 text-balance bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-[48px] font-semibold leading-[1.0] tracking-[-0.05em] text-transparent sm:text-[72px]"
          >
            Aprenda o universo fazendo ciência de verdade.
          </motion.h1>
          <motion.p variants={rise} className="mt-6 max-w-xl text-balance text-[19px] leading-relaxed text-white/55">
            Imagine o fenômeno, teste sua hipótese e meça em dados reais de telescópios espaciais. Em português, direto no navegador.
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-wrap gap-3">
            <Cta href="/app">
              Abrir o Observatório <ArrowRight className="h-4 w-4" />
            </Cta>
            <Cta href="/app/laboratorios/exoplaneta" variant="secondary">
              Ver o primeiro laboratório
            </Cta>
          </motion.div>
          <motion.p variants={rise} className="mt-5 text-[13px] text-white/35">
            Grátis para começar · sem instalar nada
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(14px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          className="relative"
        >
          <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(246,183,78,0.14),transparent_65%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#06070c]/80 backdrop-blur-xl">
            <TransitSimulator k={0.12} b={0.2} period={7} onFlux={setFlux} className="aspect-[4/3.3] w-full" />
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 font-mono text-xs text-white/80 backdrop-blur-xl">
              brilho {formatNumber(flux * 100, 2)} %
            </div>
          </div>
          <p className="mt-4 text-center text-[13px] text-white/40">Um planeta passando na frente da sua estrela. No Observatório, você mede um de verdade.</p>
        </motion.div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <motion.div {...reveal} variants={stagger(0.08)} className="max-w-2xl">
          <motion.p variants={rise} className="eyebrow">Como funciona</motion.p>
          <motion.h2 variants={rise} className="mt-4 text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[48px]">
            Primeiro você imagina. Depois você mede.
          </motion.h2>
        </motion.div>
        <motion.div {...reveal} variants={stagger(0.1, 0.1)} className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Imagine', text: 'Um cenário que você controla com as mãos: mude o tamanho de um planeta e veja a luz da estrela reagir.' },
            { icon: LineChart, title: 'Teste', text: 'Faça uma aposta antes de ver a resposta. Errar faz parte, e a explicação vem na hora.' },
            { icon: FlaskConical, title: 'Meça', text: 'Ajuste um modelo aos dados reais de um telescópio e descubra um número que só a ciência conhece.' },
          ].map((c, i) => (
            <motion.div key={c.title} variants={rise} className="glass rounded-[28px] p-7">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] text-white/80">
                  <c.icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-[13px] text-white/25">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.02em] text-white">{c.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/55">{c.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Primeiro laboratório */}
      <section id="laboratorios" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <motion.div {...reveal} variants={stagger(0.08)} className="grid overflow-hidden rounded-[36px] border border-white/[0.08] bg-white/[0.02] lg:grid-cols-2">
          <motion.div variants={rise} className="relative min-h-[320px]">
            <LabCover lab={EXOPLANETA} big className="absolute inset-0 h-full w-full" />
          </motion.div>
          <motion.div variants={stagger(0.06, 0.1)} className="p-8 sm:p-12">
            <motion.p variants={rise} className="eyebrow" style={{ color: EXOPLANETA.accent }}>
              Seu primeiro laboratório · {EXOPLANETA.minutes} min
            </motion.p>
            <motion.h2 variants={rise} className="mt-4 text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-[44px]">
              {EXOPLANETA.title}
            </motion.h2>
            <motion.p variants={rise} className="mt-4 text-[17px] leading-relaxed text-white/55">
              Com dados do telescópio TESS, você vai descobrir o tamanho de WASP-121 b, um planeta gigante que dá uma volta na estrela em 30 horas.
            </motion.p>
            <motion.ol variants={stagger(0.05)} className="mt-8 space-y-2.5">
              {EXOPLANETA.steps.map((s) => (
                <motion.li key={s.id} variants={rise} className="flex items-center gap-3 text-[15px] text-white/75">
                  <Check className="h-4 w-4 shrink-0" style={{ color: EXOPLANETA.accent }} />
                  <span className="w-[70px] shrink-0 text-[12px] font-medium uppercase tracking-[0.12em] text-white/40">{STEP_LABEL[s.kind]}</span>
                  {s.title}
                </motion.li>
              ))}
            </motion.ol>
            <motion.div variants={rise} className="mt-10">
              <Cta href="/app/laboratorios/exoplaneta">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Cta>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Céu */}
      <section id="ceu" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...reveal} variants={stagger(0.08)}>
            <motion.p variants={rise} className="eyebrow">Céu</motion.p>
            <motion.h2 variants={rise} className="mt-4 text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[48px]">
              Um céu inteiro para explorar.
            </motion.h2>
            <motion.p variants={rise} className="mt-5 text-[17px] leading-relaxed text-white/55">
              Busque por nome, catálogo ou descreva o que procura: &ldquo;nebulosas planetárias perto de M27&rdquo;. Veja o objeto no céu interativo,
              troque entre luz visível, infravermelho e ultravioleta, e baixe os dados originais do Hubble, do James Webb e do TESS.
            </motion.p>
            <motion.div variants={rise} className="mt-8">
              <Cta href="/app/ceu" variant="secondary">
                <Orbit className="h-4 w-4" /> Explorar o céu
              </Cta>
            </motion.div>
          </motion.div>
          <motion.div {...reveal} variants={stagger(0.08, 0.1)} className="grid grid-cols-2 gap-3">
            {[
              { q: 'M51', t: 'Galáxia do Rodamoinho', ra: 202.4696, dec: 47.1952, fov: 0.32 },
              { q: 'M42', t: 'Nebulosa de Órion', ra: 83.8221, dec: -5.3911, fov: 1.1 },
              { q: 'M16', t: 'Pilares da Criação', ra: 274.7, dec: -13.8069, fov: 0.6 },
              { q: 'M104', t: 'Galáxia do Sombrero', ra: 189.9976, dec: -11.6231, fov: 0.2 },
            ].map((o, i) => (
              <motion.div key={o.q} variants={rise} className={i % 2 ? 'translate-y-8' : ''}>
                <Link href={`/app/ceu?q=${encodeURIComponent(o.q)}`} className="focus-ring group relative block overflow-hidden rounded-[24px] border border-white/[0.07]">
                  <SkyThumb ra={o.ra} dec={o.dec} fov={o.fov} size={360} className="aspect-square w-full transition-transform duration-700 group-hover:scale-[1.05]" alt={o.t} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <p className="absolute bottom-3 left-3.5 text-[13px] font-medium text-white">{o.t}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vega */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <motion.div {...reveal} variants={stagger(0.08)} className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div variants={rise} className="glass order-2 space-y-4 rounded-[32px] p-6 lg:order-1">
            <div className="flex items-center gap-3">
              <VegaOrb size={32} />
              <div>
                <p className="text-[14px] font-semibold text-white">Vega</p>
                <p className="text-[12px] text-white/40">Encontre um exoplaneta · etapa 5</p>
              </div>
            </div>
            <p className="ml-auto max-w-[80%] rounded-[20px] rounded-br-md bg-white/[0.1] px-4 py-2.5 text-[14px] text-white">Qual é o tamanho certo?</p>
            <p className="max-w-[90%] text-[14px] leading-relaxed text-white/80">
              Olhe para o fundo da queda, não para as bordas. Quanto de brilho some ali? Se for perto de 1,5 %, que raio de planeta cobre essa
              fração da estrela?
            </p>
          </motion.div>
          <motion.div variants={stagger(0.08)} className="order-1 lg:order-2">
            <motion.p variants={rise} className="eyebrow">Vega</motion.p>
            <motion.h2 variants={rise} className="mt-4 text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[48px]">
              Uma guia que pergunta antes de responder.
            </motion.h2>
            <motion.p variants={rise} className="mt-5 text-[17px] leading-relaxed text-white/55">
              A Vega sabe em que etapa você está e o que está na sua tela. Ela dá pistas e faz perguntas para você chegar à resposta, em vez de
              entregá-la pronta.
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

      {/* Professores */}
      <section id="professores" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
        <motion.div {...reveal} variants={stagger(0.08)} className="glass rounded-[36px] p-8 sm:p-14">
          <motion.p variants={rise} className="eyebrow">Para professores · em breve</motion.p>
          <motion.h2 variants={rise} className="mt-4 max-w-2xl text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-[42px]">
            Laboratórios prontos para a sua turma.
          </motion.h2>
          <motion.ul variants={stagger(0.06)} className="mt-8 grid gap-4 text-[15px] text-white/60 sm:grid-cols-3">
            {['Aplique um laboratório como atividade e acompanhe quem concluiu.', 'Conteúdo alinhado à BNCC e à preparação para a OBA.', 'Dados reais para discutir ciência de verdade em sala.'].map((t) => (
              <motion.li key={t} variants={rise} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 text-center">
        <motion.div {...reveal} variants={stagger(0.08)}>
          <motion.div variants={rise} className="flex justify-center">
            <Logo size={52} glow />
          </motion.div>
          <motion.h2 variants={rise} className="mx-auto mt-8 max-w-2xl text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]">
            O céu está aberto.
          </motion.h2>
          <motion.div variants={rise} className="mt-9 flex justify-center">
            <Cta href="/app">
              Abrir o Observatório <ArrowRight className="h-4 w-4" />
            </Cta>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.05] px-5 py-10 text-[12px] leading-relaxed text-white/35">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 sm:flex-row">
          <p>AESo · Dados do MAST/STScI (TESS, Hubble, James Webb), SIMBAD e Aladin Lite (CDS, Strasbourg).</p>
          <a href="https://github.com/fabriciort/aeso" className="hover:text-white/70">
            Código aberto no GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
