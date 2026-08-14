import TableNode from "./TableNode";

export default function FloorPlan({ zonas }) {
  return (
    <div className="space-y-8">
      {zonas.map((zona) => (
        <div key={zona.nombre}>
          <h3 className="text-sm font-semibold text-ink mb-3">{zona.nombre}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {zona.mesas.map((mesa) => (
              <TableNode key={mesa.id} mesa={mesa} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}