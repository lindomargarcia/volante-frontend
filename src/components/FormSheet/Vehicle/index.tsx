import { Button } from "@/components/ui/button"
import { SheetFooter} from "@/components/ui/sheet"
import { Car } from "lucide-react"
import { Form } from "../../ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput, FormSelect } from "../../FormInput"
import { VehicleSchema, defaultVehicleValues, vehicleSchema } from "./schema"
import { SheetContainer } from "../../SheetContainer/SheetContainer"
import { useEffect, useState } from "react"
import { COLORS } from '@/data/constants/colors'
import { CAR_BRANDS } from '@/data/constants/carBrands'
import ConfirmButton from "@/components/ConfirmButton/ConfirmButton"
import { Input } from "@/components/ui/input"
import FileSelect from "@/components/ui/fileSelect"

interface IVehicleSheetsProps {
  trigger: React.ReactElement
  data?: VehicleSchema,
  onSubmit: (data: VehicleSchema) => Promise<any>,
  onDelete: (data?: VehicleSchema) => Promise<any>
  isPending: boolean
}

export function VehicleFormSheet({data, trigger, onSubmit, onDelete, isPending}: IVehicleSheetsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const form = useForm<VehicleSchema>({
    resolver: zodResolver(vehicleSchema),
    defaultValues:defaultVehicleValues
  })

  useEffect(() => {
    if(!isOpen) return
    form.clearErrors()
    form.setValue('plate', data?.plate || '')
    form.setValue('brand', data?.brand  || '')
    form.setValue('model', data?.model  || '')
    form.setValue('year', data?.year || '')
    form.setValue('color', data?.color || 'black')
  }, [data, isOpen])

  const handleOnSubmit = (data: VehicleSchema) => {
    onSubmit(data).then(() => {
      setIsOpen(false)
    })
  }

  const handleOnDelete = (data: VehicleSchema) => {
    onDelete(data).then(() => {
      setIsOpen(false)
    })
  }

  return (
    <Form {...form}>
      <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(handleOnSubmit)}>
        <div className="flex gap-2">
          <FormInput name='plate' label="Placa" form={form}>
            {field => <Input placeholder="ABC-1D23"  className={'uppercase'} {...field}/>}
          </FormInput>
          <FormSelect name="brand" label="Marca"  className="flex-1" options={CAR_BRANDS} form={form} placeholder="Selecione..." />
        </div>
        <div className="flex gap-2">
          <FormInput  name='model' label="Modelo" form={form}>
            {field => <Input  placeholder="Digite aqui..." {...field}/>}
          </FormInput>
          <FormInput name='year' className="w-[80px]" label="Ano" form={form}>
            {field => <Input placeholder="2024"  {...field}/>}
          </FormInput>
          <FormSelect name="color" className="flex-1" label="Cor" options={COLORS} form={form} placeholder="Selecione..." />
        </div>
        <SheetFooter className="mt-4 justify-between">
          <Button type="submit" disabled={isPending}>Salvar</Button>
          {data?.plate && <ConfirmButton
              onConfirm={() => handleOnDelete(data)}
              variant={"destructive"}
              disabled={isPending}
              title="Remover veículo"
              message="Deseja realmente remover o veículo desse orçamento?">
                Remover
            </ConfirmButton>}
        </SheetFooter>
      </form>
    </Form>
  )
}
