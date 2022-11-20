export default function toDate(date) {
    const currentDate = Date.parse(new Date())
    const dateNorm = Date.parse(new Date(date))
    const minutes = (currentDate - dateNorm) / (1000 * 60)
    if (minutes < 1) {
        return "a few moments ago"
    }
    if (minutes < 60) {
        if (minutes < 2)
            return "a min ago"
        return `${parseInt(minutes)} min ago`
    }
    const hours = minutes / 60
    if (hours < 24) {
        if (hours < 2)
            return "an hour ago"
        return `${parseInt(hours)} hours ago`
    }
    const days = hours / 24
    if (days < 31) {
        if (days < 2)
            return "a day ago"
        return `${parseInt(days)} days ago`
    }
    const months = days / 31
    if (months < 12) {
        if (months < 2)
            return "a month ago"
        return `${parseInt(months)} months ago`
    }
    const years = days / 365
    if (years < 2)
        return "a year ago"
    return `${parseInt(years)} years ago`

}