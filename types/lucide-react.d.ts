declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    color?: string
    strokeWidth?: number | string
  }
  
  export const ChevronUp: FC<IconProps>
  export const HelpCircle: FC<IconProps>
  export const Smartphone: FC<IconProps>
  export const MapPin: FC<IconProps>
  export const CheckCircle: FC<IconProps>
  
  // 다른 아이콘들도 필요에 따라 추가
  const LucideReact: {
    [key: string]: FC<IconProps>
  }
  
  export default LucideReact
}



