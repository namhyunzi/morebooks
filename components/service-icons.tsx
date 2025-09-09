import { Diamond, Percent, FileText, Gift, TreePine, Edit, Package, ThumbsUp, BookOpen } from "lucide-react"

const services = [
  { icon: Diamond, label: "할인혜택" },
  { icon: Percent, label: "오늘만특가" },
  { icon: FileText, label: "APP혜택" },
  { icon: Gift, label: "기프트카드" },
  { icon: TreePine, label: "바로출간" },
  { icon: Edit, label: "이달의 책" },
  { icon: Package, label: "순금배송" },
  { icon: ThumbsUp, label: "사은품" },
  { icon: BookOpen, label: "추천" },
  { icon: Edit, label: "책그리고글" },
]

export default function ServiceIcons() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-6">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 cursor-pointer hover:opacity-80">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <service.icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-center text-muted-foreground">{service.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
