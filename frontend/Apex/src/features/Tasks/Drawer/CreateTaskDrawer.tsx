import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import TaskForm from "./TaskForm"

import { useCreateTask } from "../usCreateTasks"

type CreateTaskDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateTaskDrawer({
  open,
  onOpenChange,
}: CreateTaskDrawerProps) {
  const { isPending, createTask } = useCreateTask()



  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <DrawerContent>
        <DrawerHeader className="mb-5">
          <DrawerTitle>Create task</DrawerTitle>
          <DrawerDescription>
            Create and assign a new field operations task.
          </DrawerDescription>
        </DrawerHeader>

        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <TaskForm
            onSuccess={() => onOpenChange(false)}
            createTask={createTask}
          />
        </div>

        <DrawerFooter>
          <Button type="submit" form="create-task-form" disabled={isPending}>
            {isPending ? "Creating..." : "Create task"}
          </Button>

          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
