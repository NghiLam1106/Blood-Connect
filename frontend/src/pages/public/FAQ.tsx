import { FaqList } from '../../components/faq/FaqList'
import { FaqCTA } from '../../components/faq/FaqCTA'

export default function FAQ() {
  return (
    <div className="pt-8 pb-20 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <FaqList />
        <FaqCTA />
      </div>
    </div>
  )
}
