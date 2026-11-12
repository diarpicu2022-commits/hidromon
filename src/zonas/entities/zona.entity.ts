import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Sensor } from "../../sensores/entities/sensor.entity";
import { Alerta } from "../../alertas/entities/alerta.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";

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

    @ManyToOne(() => Usuario, (usuario) => usuario.zonas, { nullable: true })
    @JoinColumn({ name: "usuario_id" })
    usuario: Usuario | null;
}
