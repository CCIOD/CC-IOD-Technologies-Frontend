# QUICK REFERENCE - SISTEMA DE VIGENCIA DE CONTRATOS

Guía rápida de importaciones y uso del sistema de vigencia de contratos.

---

## 📦 IMPORTACIONES

```typescript
// Componentes
import { ContractValidity } from '@/components/administration/ContractValidity';
import { RenewalModal } from '@/components/administration/RenewalModal';

// Servicio
import { contractService } from '@/services/contract.service';

// Interfaces
import {
  IContractValidity,
  ILastRenewal,
  IRenewalRequest,
  IRenewalResponse,
  IContractValidityResponse,
} from '@/interfaces/administration.interface';

// Utilidades
import { 
  addMonthsToDate, 
  formatDateDisplay 
} from '@/utils/format';
```

---

## 🚀 USO BÁSICO

### En componente simple
```tsx
<ContractValidity clientId={123} />
```

### Con callback de renovación
```tsx
<ContractValidity 
  clientId={123}
  onRenewalSuccess={() => {
    console.log('Renovado!');
    // Refrescar datos
  }}
/>
```

### En Modal
```tsx
<Modal isOpen={true} toggleModal={setOpen} title="Vigencia">
  <ContractValidity clientId={123} />
</Modal>
```

---

## 🔧 SERVICIO DIRECTO

### Obtener vigencia
```typescript
const response = await contractService.getContractValidity(123);
// response.data: IContractValidity
```

### Renovar contrato
```typescript
const response = await contractService.renewContract(123, {
  months_new: 6,
  renewal_document_url: 'https://...'
});
// response.data.new_expiration_date: string
```

---

## 📋 INTERFACES

### IContractValidity
```typescript
{
  client_id: number;
  placement_date: string;        // "2025-01-15"
  contract_date: string;         // "2025-01-15"
  contract_duration: number;     // 12
  expiration_date: string;       // "2026-01-15"
  months_contracted: number;     // 12
  days_remaining: number;        // 128
  is_active: boolean;            // true
  last_renewal?: {               // opcional
    renewal_date: string;
    months_added: number;
  };
}
```

### IRenewalRequest
```typescript
{
  months_new: number;            // Requerido: 1-120
  renewal_document_url?: string; // Opcional
  renewal_date?: string;         // Opcional
}
```

### IRenewalResponse
```typescript
{
  success: boolean;
  message: string;
  data: {
    client_id: number;
    new_expiration_date: string;
    total_months_contracted: number;
    days_remaining: number;
    previous_expiration_date: string;
    renewal_date: string;
    months_added: number;
  };
}
```

---

## 🎨 COLORES DE ESTADO

| Rango | Color | Clase | Significado |
|-------|-------|-------|------------|
| > 90 días | Verde | `status-green` | Vigente |
| 30-90 días | Amarillo | `status-yellow` | Por vencer |
| < 30 días | Rojo | `status-red` | Crítico |
| Vencido | Rojo | `status-expired` | Expirado |

---

## ⚙️ FUNCIONES HELPER

### Sumar meses a fecha
```typescript
import { addMonthsToDate } from '@/utils/format';

const newDate = addMonthsToDate(new Date(), 6);
```

### Formatear fecha en español
```typescript
import { formatDateDisplay } from '@/utils/format';

const text = formatDateDisplay("2025-10-28");
// Resultado: "28 de octubre de 2025"
```

---

## ✅ VALIDACIONES

### Validar meses
```typescript
const isValid = (months: number) => 
  months >= 1 && months <= 120 && Number.isInteger(months);
```

### Comprobar si puede renovarse
```typescript
const canRenew = (validity: IContractValidity) => 
  validity.is_active && validity.days_remaining > 0;
```

### Comprobar urgencia
```typescript
const isUrgent = (daysRemaining: number) => 
  daysRemaining < 30;

const isWarning = (daysRemaining: number) => 
  daysRemaining >= 30 && daysRemaining <= 90;
```

---

## 🔌 ENDPOINTS

```
GET /clientes/:id/vigencia
  ├─ Auth: JWT Bearer token
  └─ Response: IContractValidityResponse

PUT /clientes/:id/renovar-contrato
  ├─ Auth: JWT Bearer token
  ├─ Body: IRenewalRequest
  └─ Response: IRenewalResponse
```

---

## 🛡️ MANEJO DE ERRORES

```typescript
try {
  const response = await contractService.renewContract(123, {
    months_new: 6
  });
  console.log('Éxito:', response.data.new_expiration_date);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

---

## 📁 ARCHIVOS CLAVE

```
src/
├── components/administration/
│   ├── ContractValidity.tsx        ← Componente principal
│   ├── ContractValidity.css
│   ├── RenewalModal.tsx            ← Modal de renovación
│   └── RenewalModal.css
├── services/
│   └── contract.service.ts         ← Servicio HTTP
├── interfaces/
│   └── administration.interface.ts ← Interfaces
├── utils/
│   └── format.ts                   ← Helpers
└── pages/
    └── AdministrationPage.tsx      ← Integración
```

---

## 💡 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Simple
```tsx
function Page() {
  return <ContractValidity clientId={123} />;
}
```

### Ejemplo 2: Con manejo de renovación
```tsx
function Page() {
  const handleRenewal = () => {
    console.log('Contrato renovado');
  };
  
  return (
    <ContractValidity 
      clientId={123} 
      onRenewalSuccess={handleRenewal}
    />
  );
}
```

### Ejemplo 3: En tabla
```tsx
function Table() {
  const [selected, setSelected] = useState<number | null>(null);
  
  return (
    <>
      {clients.map(client => (
        <tr key={client.id}>
          <td>{client.name}</td>
          <td>
            <button onClick={() => setSelected(client.id)}>
              Ver Vigencia
            </button>
          </td>
        </tr>
      ))}
      
      {selected && (
        <Modal isOpen={true} toggleModal={() => setSelected(null)}>
          <ContractValidity clientId={selected} />
        </Modal>
      )}
    </>
  );
}
```

---

## 🚦 FLUJO DE USUARIO

1. Usuario hace clic en "📅 Vigencia"
2. Se abre Modal con ContractValidity
3. Componente carga datos automáticamente
4. Muestra:
   - Fechas del contrato
   - Días restantes con color
   - Última renovación (si existe)
5. Usuario hace clic en "Renovar Contrato"
6. Se abre RenewalModal
7. Usuario ingresa meses (1-120)
8. Previsualización actualiza
9. Usuario confirma
10. Se envía al servidor
11. Se actualiza información
12. Modal se cierra
13. Callback refrescar datos (opcional)

---

## ⚠️ COMÚN TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| "Cannot find module" | Verificar ruta de importación |
| "Error al cargar vigencia" | Verificar que cliente existe |
| "Token inválido" | Verificar autenticación |
| "Meses inválidos" | Usar 1-120, enteros |
| "Modal no se cierra" | Verificar that renovación fue exitosa |

---

## 📞 MÁS INFORMACIÓN

- Documentación completa: `IMPLEMENTATION_CONTRACT_VALIDITY.md`
- Resumen ejecutivo: `CONTRACT_VALIDITY_SUMMARY.md`
- Código fuente: Ver archivos en `src/components/administration/`

---

**¡Todo listo para usar!** 🚀

