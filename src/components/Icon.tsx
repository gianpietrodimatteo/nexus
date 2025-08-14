import * as React from "react"

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string
  size?: number | string
}

export function Icon({ name, size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  )
}

export default Icon


