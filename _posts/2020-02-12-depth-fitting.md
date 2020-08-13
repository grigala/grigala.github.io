---
title: '3 განზომილებიანი მორფოლოგიური მოდელის სახის ეფექტური აპროქსიმაცია ერთადერთი სურათის და სიღრმული კამერის ტექნოლოგიის გამოყენებით'
date: 2020-02-12
permalink: /posts/2020/02/depth-fitting/
tags:
  - Computer Vision
  - Machine Learning
  - Computer Science
  - Artificial Intelligence
  - GE
excerpt: 'აღნიშნული ბლოგ პოსტი წარმოადგენს  ერთ-ერთი ჩემი ნაშრომის შეჯამებას და ქართულად ახსნას(ეგებ ვინმემ გაიგოს😁).
          ორიგინალის წაკითხვის სურვილი ვისაც გაქვთ ეწვიეთ [ამ გვერდს](https://github.com/grigala/MScThesis/blob/master/Thesis.pdf). თანმხლები კოდის პროექტი შეგიძლიათ იხილოთ [აქ](https://github.com/grigala/3DMMDepthFitting)'
---
{% include base_path %}
{% include toc %}
<style>
.page__inner-wrap p {
    font-family: "BPG Arial" !important;
}
.page__inner-wrap h2 {
    font-family: "BPG Nino Mtavruli" !important;
    text-align: center;
}
.page__inner-wrap h3 {
    font-family: "BPG Nino Mtavruli" !important;
}
.page__title {
    font-family: "BPG Nino Mtavruli" !important;
}
</style>
<script lang="text/javascript">
let refresh = document.createElement('meta');
let thumb = document.createElement('meta');

refresh.setAttribute('http-equiv', 'refresh');
thumb.setAttribute('property', 'og:image');

refresh.content = 360;
thumb.content = '';

document.getElementsByTagName('head')[0].appendChild(refresh);
documment.getElementsByTagName('head')[0].append(thumb);
</script>

აღნიშნული ბლოგ პოსტი წარმოადგენს  ერთ-ერთი ჩემი ნაშრომის შეჯამებას და ქართულად ახსნას(ეგებ ვინმემ გაიგოს😁).
ორიგინალის წაკითხვის სურვილი ვისაც გაქვთ ეწვიეთ <a href="https://github.com/grigala/MScThesis/blob/master/Thesis.pdf" target="_blank" rel="noopener">ამ გვერდს</a>. თანმხლები კოდის პროექტი შეგიძლიათ იხილოთ <a href="https://github.com/grigala/3DMMDepthFitting" target="_blank" rel="noopener">აქ</a>(გაითვალისწინეთ რო საკმაოდ ბევრი კონფიგურაცია მოგიწევთ მანამ კოდის უშუალოდ გაშვებას შეძლებთ, დრო თუ მექნა დოკერის კონტეინერს გავაკეთებ მაგრამ ამ ეტაპზე მსგავსი არაფერი მაქ დაგეგმილი).

## წინასიტყვაობა
### არატექნკური:
დავიწყოთ იქიდან რო არ ვიცი რამდნეის გადათარგმნას შევძლებ ქართულად. ვინც არ იცით და არ შეგინიშნავთ უკიდეგანოდ არატექნიკური ენაა ქართული და უამრავი ტექნიკური სიტყვის თუ პროცესის ქართული შესატყვისი ან საერთოდ არ არსებობს, ან არასწორად ჟღერს. რაც მთავარია პირდაპირი თარგმანი მცდარ წარმოდგენას უქნის მკითხველს/მსმენელს(განურჩევლად იმისა ერკვევა პიროვნება ტექნიკურ ასპექტებში თუ ვერა). ასე რო წინასწარ ვამბობ, ვეცდები გადავთარგმნო ყველა ტექნიკური ასპექტი მაგრამ გარანტიას ვერ მოგცემთ და შედეგად ხშირად საერთაშორისო ტერმინს ვიხმარ დამაბნეველი პირდაპირი ნათარგმნის მაგივრად.

### ტექნიკური:

## მოტივაცია და შესავალი

## საჭირო ინფორმაცია
### 3D მორფოლოგიური მოდელი
<pre class="language-scala"><code>
case class Parameters(translationParameters: EuclideanVector[_3D],
                          rotationParameters: (Double, Double, Double),
                          modelCoefficients: DenseVector[Double])

case class Sample(generatedBy: String, rps: RenderParameter, rotationCenter: Point[_3D]) {
        /* Converting RenderParameter to Parameter */
        val parameters: Parameters = MoMoHelpers.convertRenderParametersToParameters(rps)

        def poseTransformation: RigidTransformation[_3D] = {
            val translation: TranslationTransform[_3D] = TranslationTransform(parameters
                                                                        .translationParameters)
            val rotation: RotationTransform[_3D] = RotationTransform(
                parameters.rotationParameters._3,
                parameters.rotationParameters._2,
                parameters.rotationParameters._1,
                rotationCenter
            )
            RigidTransformation(translation, rotation)
        }

        def transform: Affine3D = RenderTransforms.modelTransform(
            translation = parameters.translationParameters,
            scaling = 1.0,
            pitch = parameters.rotationParameters._1,
            yaw = parameters.rotationParameters._2,
            roll = parameters.rotationParameters._3
        )
    }
</code>
</pre>


### ბაიესის ანალიზი

<pre class="language-scala"><code>
case class RotationProposal(stddev: Double) extends
        ProposalGenerator[Sample] with TransitionProbability[Sample] {
    val perturbationDistr = new MultivariateNormalDistribution(
        DenseVector.zeros[Double](3),
        DenseMatrix.eye[Double](3) * stddev * stddev)

    def propose(sample: Sample): Sample = {
        val perturbation: DenseVector[Double] = perturbationDistr.sample
        val newRotationParameters: (Double, Double, Double) = (
                sample.parameters.rotationParameters._1 + perturbation(0),
                sample.parameters.rotationParameters._2 + perturbation(1),
                sample.parameters.rotationParameters._3 + perturbation(2)
        )
        val newParameters = sample.parameters.copy(rotationParameters = newRotationParameters)

        val rpTemplate: RenderParameter = RenderParameter.default
        val newParamsConverted = MoMoHelpers
            .convertParametersToRenderParameters(newParameters, rpTemplate
        )

        sample.copy(generatedBy=s"RotationUpdateProposal ($stddev)", rps=newParamsConverted)
    }

    override def logTransitionProbability(from: Sample, to: Sample): Double = {
        val residual: DenseVector[Double] = DenseVector(
            to.parameters.rotationParameters._1 - from.parameters.rotationParameters._1,
            to.parameters.rotationParameters._2 - from.parameters.rotationParameters._2,
            to.parameters.rotationParameters._3 - from.parameters.rotationParameters._3
        )
        perturbationDistr.logpdf(residual)
    }
}
</code>
</pre>

<pre class="language-scala"><code>
case class TranslationProposal(stddev: Double) extends
        ProposalGenerator[Sample] with TransitionProbability[Sample] {

    val perturbationDistr: MultivariateNormalDistribution = new MultivariateNormalDistribution(
        DenseVector.zeros(3),
        DenseMatrix.eye[Double](3) * stddev * stddev
    )

    def propose(sample: Sample): Sample = {
        val newTranslationParameters = 
            sample.parameters.translationParameters + 
            EuclideanVector.fromBreezeVector(perturbationDistr.sample())
        val newParameters = sample.parameters.copy(
                translationParameters = newTranslationParameters
        )

        val rpTemplate: RenderParameter = RenderParameter.default
        val newParamsConverted: RenderParameter = MoMoHelpers
                .convertParametersToRenderParameters(newParameters, rpTemplate)


        sample.copy(generatedBy=s"TranlationUpdateProposal ($stddev)", rps=newParamsConverted)
    }

    override def logTransitionProbability(from: Sample, to: Sample): Double = {
        val residual: EuclideanVector[_3D] = to.parameters.translationParameters - 
                                             from.parameters.translationParameters
        perturbationDistr.logpdf(residual.toBreezeVector)
    }
}
</code>
</pre>



### სიღრმული კამერის ტექნოლოგია

<img src='https://raw.githubusercontent.com/grigala/3DMMDepthFitting/master/demo/combined.gif' width='99%' alt=""/>
