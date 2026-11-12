import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Lectura } from "../../lecturas/entities/lectura.entity";
import { Zona } from "../../zonas/entities/zona.entity";

@Entity({
    name: "alertas",
})
export class Alerta {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 50 })
    nivel: string;

    @Column({ type: "text" })
    mensaje: string;

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

    @ManyToOne(() => Lectura, (lectura) => lectura.alertas, { nullable: false })
    @JoinColumn({ name: "lectura_id" })
    lectura: Lectura;

    @ManyToOne(() => Zona, (zona) => zona.alertas, { nullable: false })
    @JoinColumn({ name: "zona_id" })
    zona: Zona;
}
