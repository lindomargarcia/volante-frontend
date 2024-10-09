import { Car, File, Save, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FileSelect from "@/components/ui/fileSelect";
import { CustomerForm } from "@/components/FormSheet/Customer";
import { VehicleForm } from "@/components/FormSheet/Vehicle";
import ServiceOrderItems from "../../components/ServiceOrderItems/ServiceOrderItems";
import { ServiceOrderItem } from "./types";
import { DEFAULT_CUSTOMER_VALUE } from "@/components/FormSheet/Customer/schema";
import { VehicleSchema, DEFAULT_VEHICLE_VALUES } from "@/components/FormSheet/Vehicle/schema";
import { toast } from "sonner";
import StatusDropDown from "@/components/BadgeDropDown/BadgeDropDown";
import { SO_STATUS_LIST } from "@/data/constants/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { ServiceOrderPDF } from "@/components/PDF/ServiceOrderPDF";
import { Modal } from "@/components/Modal/Modal";
import CarServiceSelector from "@/components/CarPartsSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { CAR_ACTIONS, ICarSelectionValue, IChangeValue } from "@/components/CarPartsSelector/types";
import { COLORS } from "@/data/constants/colors";
import { useServiceOrderStore } from "@/hooks/useServiceOrder";
import { deleteServiceOrderItem, putServiceOrderAPI } from "@/data/api/ServiceOrderAPI";

function ServiceOrderPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'damage' | string>('customer')
  const {id, customer,vehicle,items,car_map,status, setCustomer,setVehicle,setItems,setCarMap,setStatus} = useServiceOrderStore()

  const handleNewSOItem = async (newItem: ServiceOrderItem) => {
    toast.message("Novo item adicionado com sucesso!")
    setItems([newItem, ...items])
  }

  const handleChangeItem = (changedItem: ServiceOrderItem) => {
    const updatedItems = items.map((item) => {
      return (item.id === changedItem.id) ? changedItem : item
    })
    setItems(updatedItems)
  }

  const handleRemoveItem = (deletedItem: ServiceOrderItem) => {
    deleteServiceOrderItem(deletedItem.id).then((data) => {
      console.log(data)
      const updatedItems = items.filter((item) => (item.id !== deletedItem.id))
      setItems(updatedItems)
    })
  }

  const handleCarMapChange = async (selected: IChangeValue, data: ICarSelectionValue) => {
    if(selected.action.value === CAR_ACTIONS.DAMAGE) return

    const newItem: ServiceOrderItem = {id: '389', description: selected.action.value + ' ' + selected.car_part, discount: 0, quantity: 1, total: 50, type: selected.action.value, insurance_coverage: 0, value: 50}
    setItems([newItem, ...items])
    console.log(selected)
    setCarMap(data)
  }

  const getVehicleColor = (vehicle: VehicleSchema) => {
    return COLORS.find(color => color.value === vehicle.color)?.code || "#000"
  }

  const handleOnSave = () => {
    console.log({id, customer, vehicle, items, status})
    putServiceOrderAPI({id, customer, vehicle, items, status}).then((data) => {
      console.log(data)
      data?.customer && setCustomer(data?.customer)
      data?.vehicle && setVehicle(data?.vehicle)
      toast.message("Salvo com sucesso!")
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex gap-12">
        {/* Left side */}
        <div className="flex w-[500px] flex-col gap-4">
        {/* <CarServiceSelector/> */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="customer"><User className="w-[18px] mr-2"/>Dados Pessoais</TabsTrigger>
              <TabsTrigger value="damage"><Car className="w-[18px] mr-2"/>Mapa Veicular</TabsTrigger>
            </TabsList>
            <TabsContent value="damage" hidden={activeTab !== 'damage'} forceMount>
              <CarServiceSelector color={getVehicleColor(vehicle)} value={car_map} onChange={handleCarMapChange}/>
              <Card className="p-4 rounded-lg mt-3">
                <FileSelect label="Imagens"/>
              </Card>
            </TabsContent>
            <TabsContent value="customer">
              <div className="flex flex-col gap-4">
                <Card className="px-4 rounded-lg">
                  <CustomerForm 
                    onSubmit={setCustomer}
                    onDelete={() => setCustomer(DEFAULT_CUSTOMER_VALUE)}
                    isPending={false}
                    data={customer}
                  />
                </Card>
                <Card className="px-4 rounded-lg">
                  <VehicleForm 
                    onSubmit={setVehicle}
                    onDelete={() => setVehicle(DEFAULT_VEHICLE_VALUES)}
                    isPending={false}
                    data={vehicle}
                  />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* right Side */}
        <div className="flex flex-1 flex-col">
          <ServiceOrderHeader status={status} onStatusChange={setStatus}/>
          <ServiceOrderItems 
            data={items}
            onAddItem={handleNewSOItem}
            onChangeItem={handleChangeItem}
            onRemoveItem={handleRemoveItem}
          />
          <div className="flex mt-6 justify-end items-end gap-3">
            <Modal 
              trigger={<Button variant="outline"><File size={18} className="mr-2"/>PDF</Button>}
              title='Orçamento'
              subtitle='Envie ou imprima para seu cliente'
              className="min-h-[calc(100vh-180px)]"
              async={true}>
                <PDFViewer className="w-full min-h-[calc(100vh-180px)]">
                  <ServiceOrderPDF data={{customer, vehicle, items, status}}/>
                </PDFViewer>
            </Modal>
            <Button onClick={handleOnSave}>
              <Save size={18} className="mr-2"/>Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IServiceOrderHearderProps {
  status: any,
  onStatusChange: (status: string) => void
}

const ServiceOrderHeader = ({status, onStatusChange}: IServiceOrderHearderProps) => {
  return(
    <header className="flex items-center pb-4">
      <div className="flex gap-10 flex-1">
        <div>
          <h1 className="text-2xl font-semibold">Orçamento</h1>
          <p className="text-sm text-muted-foreground">
            Informe abaixo os serviços que serão realizados no veículo
          </p>
        </div>
      </div>
      <StatusDropDown value={status} title="Situação atual" options={SO_STATUS_LIST} onChange={onStatusChange}/>
    </header>
  )
}
export default ServiceOrderPage;