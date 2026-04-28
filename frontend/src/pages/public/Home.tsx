import { HeroSection } from '../../components/home/HeroSection'
import { StatsSection } from '../../components/home/StatsSection'
import { GridSection } from '../../components/home/GridSection'
import { BenefitsSection } from '../../components/home/BenefitsSection'
import { StoryCTASection } from '../../components/home/StoryCTASection'

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <GridSection />
      <BenefitsSection />
      <StoryCTASection />
    </div>
  )
}
