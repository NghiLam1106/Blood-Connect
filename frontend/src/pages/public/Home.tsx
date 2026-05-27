import { HeroSection } from '../../components/home/HeroSection'
import { StatsSection } from '../../components/home/StatsSection'
import { GridSection } from '../../components/home/GridSection'
import { BenefitsSection } from '../../components/home/BenefitsSection'
import { StoryCTASection } from '../../components/home/StoryCTASection'
import FeaturesSection from '../../components/home/FeaturesSection'
import ProcessSection from '../../components/home/ProcessSection'

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <StatsSection />
      <GridSection />
      <FeaturesSection />
      <ProcessSection />
      <BenefitsSection />
      <StoryCTASection />
    </div>
  )
}
