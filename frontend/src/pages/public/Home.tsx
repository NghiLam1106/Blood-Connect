import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { HeroSection } from '../../components/home/HeroSection'
import { StatsSection } from '../../components/home/StatsSection'
import FeaturesSection from '../../components/home/FeaturesSection'
import { GridSection } from '../../components/home/GridSection'
import { BenefitsSection } from '../../components/home/BenefitsSection'
import { StoryCTASection } from '../../components/home/StoryCTASection'

export default function Home() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [location])

  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <GridSection />
      <BenefitsSection />
      <StoryCTASection />
    </div>
  )
}
