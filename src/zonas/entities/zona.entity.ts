import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sensor } from "../../sensores/entities/sensor.entity";
import { Alerta } from "../../alertas/entities/alerta.entity";

@Entity({
    name: "zonas",
})
export class Zona {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    nombre: string;

    @Column({ type: "varchar", length: 100 })
    cultivo: string;

    @Column({ type: "float", name: "humedad_min" })
    humedadMin: number;

    @Column({ type: "float", name: "humedad_max" })
    humedadMax: number;

    @CreateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "created_at"
        })
    createdAt: Date;

    @UpdateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "updated_at"
        })
    updatedAt: Date;

    @OneToMany(() => Sensor, (sensor) => sensor.zona)
    sensores: Sensor[];

    @OneToMany(() => Alerta, (alerta) => alerta.zona)
    alertas: Alerta[];
}
