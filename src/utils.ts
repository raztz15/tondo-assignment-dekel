import { ILaunch } from "./interfaces"

export const sortLaunches = (launches: ILaunch[], criterion: string): ILaunch[] => {
    const updatedData = [...launches]
    switch (criterion) {
        case 'date':
            return updatedData.sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime())

        case 'success':
            return updatedData.sort((a, b) => {
                if (a.success === b.success) return 0
                return a.success ? -1 : 1 //success comes first
            })

        case 'rocketName':
            return updatedData.sort((a, b) => (a.rocketName ?? '').localeCompare(b.rocketName ?? ''))

        default:
            return updatedData
    }

}