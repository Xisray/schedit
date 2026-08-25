import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Edit, Trash2 } from "lucide-react"

type Props<T> = {
  title: string
  emptyMessage: string
  items: T[]
  onEdit: (item: T) => void
  clear: () => void
  getKey: (item: T) => string | number
  remove: (item: T) => void
  children: (item: T) => ReactNode
}

export default function ItemsList<T>({
  title,
  emptyMessage,
  items,
  onEdit,
  clear,
  getKey,
  remove,
  children,
}: Props<T>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => clear()}
          disabled={items.length === 0}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Удалить всё
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {items.map((item) => {
              return (
                <Card
                  key={getKey(item)}
                  className="relative overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between">
                    {children(item)}

                    {/* Действия */}
                    <div className="ml-3 flex flex-col gap-1 border-l pl-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
